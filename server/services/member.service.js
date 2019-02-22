var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('members');

var service = {};

service.authenticate = authenticate;
service.getAll = getAll;
service.getById = getById;
service.create = create;
service.update = update;
service.delete = _delete;

module.exports = service;

function authenticate(membername, password) {
    var deferred = Q.defer();

    db.members.findOne({ membername: membername },function (err,member) {
        if(err) deferred.reject(err.name + ': '+err.message);

        if(member && bcrypt.compareSync(password,member.hash)){
            //authentication successful
            deferred.resolve({
                _id: member._id,
                membername: member.membername,
                email: member.email,
                room: member.room,
                tel: member.tel,
                credit: member.credit,
                token: jwt.sign({ sub: member._id }, config.secret) 
            });
        }else{
            //authentication failed
            deferred.resolve();
        }
    });
    return deferred.promise;
}

function getAll() {
    var deferred = Q.defer();

    db.members.find().toArray(function (err,members) {
        if(err) deferred.reject(err.name + ': ' + err.message);

        // return members (withour hashed passwords)
        members = _.map(members, function (member) {
            return _.omit(member, 'hash');
        });

        deferred.resolve(members);
    });

    return deferred.promise;
}

function getById() {
    var deferred  =Q.defer();

    db.members.findById(_id, function(err, member) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        
        if (member) {
           //return member (without hashed password)
           deferred.resolve(_.omit(member, 'hash'));
        }else{
            //member not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function create(memberParam) {
    var deferred = Q.defer();

    //validation
    db.members.findOne(
        { membername: memberParam.membername },
        function (err, member) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            if (member) {
                // username already exists
                deferred.reject('Membername "' + memberParam.membername + '" is already taken');
            } else {
                createMember();
            }
        });
        function createMember() {
            // set user object to userParam without the cleartext password
        var member = _.omit(memberParam, 'password');

        // add hashed password to user object
        member.hash = bcrypt.hashSync(memberParam.password, 10);
        console.log(memberParam);

        db.members.insert(
            member,
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function update(_id, memberParam) {
    var deferred = Q.defer();

    //validation
    db.members.findById(_id, function (err, member) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (member.membername !== memberParam.membername) {
            // username has changed so check if the new username is already taken
            db.members.findOne(
                { membername: memberParam.membername },
                function (err, member) {
                    if (err) deferred.reject(err.name + ': ' + err.message);

                    if (member) {
                        // username already exists
                        deferred.reject('Membername "' + req.body.membername + '" is already taken')
                    } else {
                        updateMember();
                    }
                });
        } else {
            updateMember();
        }
    });
    function updateMember() {
        //fields to update
        var set = {
            membername: memberParam.membername,
            email: memberParam.email,
            room: memberParam.room,
            tel: memberParam.tel,
            credit: memberParam.credit,
        };

        //update password if it was entered
        if (memberParam.password) {
            set.hash = bcrypt.hashSync(memberParam.password, 10);
        }

        db.members.update(
            { _id: mongo.helper.toObjectID(_id) },
            { $set: set },
            function (err,doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }
    return deferred.promise;
}

function _delete(_id) {
    var deferred = Q.defer();

    db.members.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' +err.message);

            deferred.resolve();
        });
        
        return deferred.promise;
}
