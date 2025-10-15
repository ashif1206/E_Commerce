
export function handleResponse(res,statusCode,message){
    return res.status(statusCode).json(message);
}