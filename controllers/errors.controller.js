function handlePsqlErrors(error, request, response, next) {
    if(error.code === '22P02') {
        response.status(400).send({msg: 'bad request'})
    } else {
        next(error)
    }
}

function handleCustomErrors(error, request, response, next) {
    if(error.status) {
        response.status(error.status).send({msg: error.msg})
    } else {
        next(error)
    }
}

function handleServerErrors(error, request, response, next) {
    console.log(error, "Handle server errors")
    response.status(500).send({msg: 'internal server error'})
}


module.exports = {handlePsqlErrors, handleCustomErrors, handleServerErrors}