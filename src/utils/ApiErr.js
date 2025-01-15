class ApiErr extends Error{

    constructor(
        statusCode,
        message="Something went wrong",
        error=[],
        statck=""
    ){
        super(message)
        this.statusCode = statusCode
        this.error = error,
        this.data =null

        if(statck){
            this.statck = statck
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }

}