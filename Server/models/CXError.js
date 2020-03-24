class CXError extends Error {
    constructor(type,description,error){
        super(type);
        this.type = type;
        this.description = description;
        this.error = error;
    }

}
module.exports = CXError