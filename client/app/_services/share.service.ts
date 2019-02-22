import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { appConfig } from '../app.config';

const ADMIN_CREATEUSER_API = '/users/register';
const ADMIN_OPERATE_API = '/users/';
const MEMBER_CREATE_API = '/members/register';
const MEMBER_API = '/members/';

 export interface User {
    _id: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
}

 export interface Member {
    _id: string;
    membername: string;
    password: string;
    room: string;
    tel: string;
    email: string;
    credit: string;
}

 export interface UserID {
    _id: string;
}



@Injectable()
export class UserService {
    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<User[]>(appConfig.apiUrl + ADMIN_OPERATE_API);
    }

    getById(params: UserID) {
        return this.http.get(appConfig.apiUrl + ADMIN_OPERATE_API + params);
    }

    create(params: User) {
        return this.http.post(appConfig.apiUrl + ADMIN_CREATEUSER_API, params);
    }

    update(params: User) {
        return this.http.put(appConfig.apiUrl + ADMIN_OPERATE_API + params._id, params);
    }

    delete(_id: string) {
        return this.http.delete(appConfig.apiUrl + ADMIN_OPERATE_API + _id);
    }

    createMember(member: Member) {
        return this.http.post(appConfig.apiUrl + MEMBER_CREATE_API, member);
    }

    getAllMember() {
        return this.http.get<Member[]>(appConfig.apiUrl + MEMBER_API );
    }

    deleteMember(_id: string) {
        return this.http.delete(appConfig.apiUrl + MEMBER_API + _id);
    }

    updateMember(params: Member) {
        return this.http.put(appConfig.apiUrl + MEMBER_API + params._id, params);
        
    }
}