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

function authenticate(membername, password, token) {
    var deferred = Q.defer();

    db.members.findOne({ membername: membername },function (err,member) {
        if(err) deferred.reject(err.name + ': '+err.message);
        if (!member) deferred.resolve();

        var passHash = false;
        if (password != undefined || password != null) {
            passHash = bcrypt.compareSync(password, member.hash);
        }
        console.log("compare hash: " + passHash);

        var passToken = false;
        if (token != undefined || token != null) {
            passToken = token == member.token;
        }
        console.log("compare token: " + passToken);
        
        if(passToken || passHash){
            //authentication successful
            deferred.resolve({
                _id: member._id,
                membername: member.membername,
                email: member.email,
                room: member.room,
                tel: member.tel,
                credit: member.credit,
                createTime: member.createTime,
                waterFlow: member.waterFlow
                // token: jwt.sign({ sub: member._id }, config.secret) 
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
            console.log(memberParam);
            // set member object to memberParam without the cleartext password
            var member = _.omit(memberParam, 'password');
            // add hashed password to member object
            member.hash = bcrypt.hashSync(memberParam.password, 10);
            // add token for qrcode to member object
            member.token = 'tetedamowang';
            member.createTime = Date.now();
            member.waterFlow = 0;
            console.log(member);
            db.members.insert(
                member,
                function (err, doc) {
                    if (err) deferred.reject(err.name + ': ' + err.message);

                    deferred.resolve({
                        _id: member._id,
                        membername: member.membername,
                        email: member.email,
                        room: member.room,
                        tel: member.tel,
                        credit: member.credit,
                        createTime: member.createTime,
                        waterFlow: member.waterFlow
                    });
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
            membername: member.membername,
            email: member.email,
            room: member.room,
            tel: member.tel,
            credit: member.credit,
            createTime: member.createTime,
            waterFlow: member.waterFlow
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
