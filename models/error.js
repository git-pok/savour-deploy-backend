class ExpressError extends Error {
    constructor(status, msg) {
        super();
        this.status = status;
        this.msg = msg;
        console.error(this.stack);
    };
}

module.exports = ExpressError;