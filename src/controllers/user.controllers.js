import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErr.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  const user = await User.findById(userId);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const userRegister = asyncHandler(async (req, res) => {
  //  get user details from frontend
  //  validationn - not empty
  //  check if already exist or not
  //  check for image, check for avatar
  //  upload them on cloudinary, avatar
  //  create user object - create entry on db
  //  remove password and refersh token field from response
  //  check for user creation
  //  return response

  const { username, fullName, email, password } = req.body;
  //    console.log(username, fullName, email)
  //    console.log(req.body)

  if (
    [username, fullName, email, password].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "All field are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "username or email already exists!");
  }

  // console.log(req.files)

  const avatarLocalPath = req.files?.avatar[0]?.path;

  let coverImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required!");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required!");
  }

  const user = await User.create({
    fullName,
    password,
    email,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    username: username.toLowerCase(),
  });

  const createUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createUser) {
    throw new ApiError(500, "something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createUser, "user registered successfully"));
});

const options = {
  httpOnly: true,
  secure: true,
};

const loginUser = asyncHandler(async (req, res) => {
  // get data from res.body
  // validate it
  // check user exist or not
  // check password
  // generate access and refersh token
  // send cookies

  const { email, password, username } = req.body;
  console.log(email, username, password);
  if (!username && !email) {
    throw new ApiError(400, "Username or email are required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist!");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Password is Incorrect");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedUser,
          accessToken,
          refreshToken,
        },
        "User Logged in Successfully"
      )
    );
});

const logOut = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        refreshToken: 0,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // get the token from cookie or req.body
  // vaildate  it
  // decoded it through jwt
  // find the user through id
  // compare token through user-refreshToken
  // generate access and refresh token
  // return res and set it in cookies

  const incomingToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingToken) {
    throw new ApiError(401, "Unauthorized request!");
  }

  try {
    const decodedToken = jwt.verify(
      incomingToken,
      process.env.REFRESH_TOKEN_CODE
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    if (incomingToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access Token Refreshed!"
        )
      );
  } catch (error) {
    throw new ApiError(401, error.message || "Invalid Refresh Token");
  }
});

const updateUserPassword = asyncHandler(async (req, res) => {
  // get both password old and new
  // validate it
  // check old password match or not
  // update password
  // return message
  const { oldPassword, newPassword } = req.body;

  console.log(oldPassword, newPassword);

  if (!oldPassword && !newPassword) {
    throw new ApiError(401, "Both Password is required!");
  }

  const user = await User.findById(req.user?._id);

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(401, "Your Password doesn't match!");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Update Successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User Fetched successfully"));
});



const updateUserDetails = asyncHandler(async (req, res) => {
  // get data from req.body
  // validate it
  // update it
  // return res

  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(401, "All feild are required!");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User details successfully"));
});



const updateUserAvatar = asyncHandler(async (req, res) => {
  // get file throw multer
  // validate it
  // upload file on cloudinary
  // get url and update in db
  // return success msg

  const avatarLocalPath = req.file?.path;
  console.log(req.file?.path);

  if (!avatarLocalPath) {
    throw new ApiError(401, "File is required for avatar!");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Avatar file is required!");
  }

  const user = await User.findById(req.user?._id);
  const oldAvatar = user.avatar;

  if (oldAvatar) {
    await deleteOnCloudinary(oldAvatar);
  }

  user.avatar = avatar.url;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar Image Update Successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  // get file throw multer
  // validate it
  // upload file on cloudinary
  // get url and update in db
  // return success msg

  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "File is Required!");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "File is required!");
  }

  const user = await User.findById(req.user?._id);
  const oldCoverImage = user.coverImage;

  if (oldCoverImage) {
    await deleteOnCloudinary(oldCoverImage);
  }

  user.coverImage = coverImage.url;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, user, "CoverImage Update Successfully"));
});

const deleteUser = asyncHandler(async (req, res) => {
  // get data from req.body
  // validate it
  // check username and password match or not
  // delete user
  // return msg

  const { username, password } = req.body;

  if (!username && !password) {
    throw new ApiError(400, "username or password required!");
  }

  const user = await User.findById(req.user?._id);

  if (username !== user.username) {
    throw new ApiError(400, "invalid username");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(400, "invalid password");
  }

  if (user.coverImage) {
    await deleteOnCloudinary(user.coverImage);
  }

  if (user.avatar) {
    await deleteOnCloudinary(user.avatar);
  }

  await User.deleteOne({ _id: user._id });

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User deleted successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  console.log(username);

  if (!username.trim()) {
    throw new ApiError(400, "Username is required");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.trim().toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        followers: {
          $size: "$subscribers",
        },
        following: {
          $size: "$subscribedTo",
        },
        isFollowed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        email: 1,
        avatar: 1,
        coverImage: 1,
        followers: 1,
        following: 1,
        isFollowed: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "channel not Found");
  }
  console.log(channel);

  return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "channel profile fetched"));
});

const getUserWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: new mongoose.Types.ObjectId(req.user?._id),
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchedVideo",
        foreignField: "_id",
        as: "watchedVideo",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  if(!user.length){
    throw new ApiError(500, "Failed to Fetched watched history")
  }

  return res.status(200)
         .json(new ApiResponse(200, user[0].watchedVideo, "User's watched history fetched successfully"));
});

export {
  userRegister,
  loginUser,
  logOut,
  refreshAccessToken,
  updateUserPassword,
  getCurrentUser,
  updateUserDetails,
  updateUserAvatar,
  updateUserCoverImage,
  deleteUser,
  getUserChannelProfile,
  getUserWatchHistory,
};
