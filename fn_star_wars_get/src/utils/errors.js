class LanguageNotSupported extends Error {
    constructor(message) {
        super(message);
        this.name = "LanguageNotSupported";
    }
}

class ResourceNotFoundExternalService extends Error{
    constructor(message) {
        super(message);
        this.name = "ResourceNotFoundExternalService";
    }
}

module.exports = {
    LanguageNotSupported,
    ResourceNotFoundExternalService
};
