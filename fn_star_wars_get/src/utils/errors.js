class LanguageNotSupported extends Error {
    constructor(message) {
        super(message);
        this.name = "LanguageNotSupported";
    }
}

module.exports = {
    LanguageNotSupported,
};
