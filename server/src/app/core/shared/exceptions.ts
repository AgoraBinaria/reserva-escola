import { ObjectID } from 'mongodb';
import { HttpException, HttpStatus } from 'nest.js';
/*400*/
export class BadRequestException extends HttpException {
    constructor(msg: string | object) {
        super(msg, HttpStatus.BAD_REQUEST);
    }
}

/*401*/
export class UnauthorizedException extends HttpException {
    constructor(msg: string | object) {
        super(msg, HttpStatus.UNAUTHORIZED);
    }
}

/*403*/
export class ForbiddenException extends HttpException {
    constructor(msg: string | object) {
        super(msg, HttpStatus.FORBIDDEN);
    }
}

/*404*/
export class NotFoundException extends HttpException {
    constructor(msg: string | object) {
        super(msg, HttpStatus.NOT_FOUND);
    }
}

/*409*/
export class ConflictException extends HttpException {
    constructor(msg: string | object) {
        super(msg, HttpStatus.CONFLICT);
    }
}

/*410*/
export class GoneException extends HttpException {
    constructor(msg: string | object) {
        super(msg, HttpStatus.GONE);
    }
}

export class ObjectIDException extends BadRequestException {
    constructor(id: string | ObjectID) {
        super(`Id '${id}' is invalid`);
    }
}
