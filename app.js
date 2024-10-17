"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const uuid_1 = require("uuid");
const mongoose_1 = __importDefault(require("mongoose"));
const apiModel_1 = __importDefault(require("./models/apiModel"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
mongoose_1.default.connect(process.env.MONGO_URL)
    .then(() => {
    console.log('MongoDB connected succesfully!!');
})
    .catch((e) => {
    console.log('MongoDB connection error', e);
});
function checkApi(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const authorizationHeader = req.headers['authorization'];
        console.log('Authorization Header:', authorizationHeader);
        let apikey;
        if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
            apikey = authorizationHeader.split(' ')[1];
        }
        else {
            res.status(401).send({ error: 'No Api key found in headers!!' });
            return;
        }
        try {
            const apiKeyRecord = yield apiModel_1.default.findOne({ key: apikey });
            if (!apiKeyRecord) {
                res.status(403).send({ error: 'Api key not found!!' });
                return;
            }
            if (new Date() > apiKeyRecord.expiredAt) {
                res.status(403).send({ error: 'Api key has expired!!' });
                return;
            }
            next();
        }
        catch (error) {
            res.status(500).send({ error: 'server error' });
            return;
        }
    });
}
//route to generate a api key
app.get('/api-key', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const newApiKey = (0, uuid_1.v4)();
    const expiredAt = new Date(Date.now() + 30 * 60 * 1000);
    try {
        const apikeyrecord = new apiModel_1.default({
            key: newApiKey,
            expiredAt: expiredAt
        });
        yield apikeyrecord.save(); //saved the apikey record in database
        res.json({
            message: 'API key generated.',
            key: newApiKey,
            expiredAt: expiredAt
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Could not generate API key.' });
    }
}));
// now protected routes that requires API key
app.get('/api/protected-route-1', checkApi, (req, res) => {
    res.json({ message: 'You can access protected route!!' });
});
app.get('/api/protected-route-2', checkApi, (req, res) => {
    res.json({ message: 'You can access this protected route as well!!' });
});
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
