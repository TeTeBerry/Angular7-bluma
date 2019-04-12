var express = require('express');
var router = express.Router();
var memberService = require('services/member.service');

//routes
router.post('/authenticate', authenticate);
router.post('/register', register);
router.get('/', getAll);
router.get('/current', getCurrent);
router.put('/:_id',update);
router.delete('/:_id', _delete);

module.exports = router;

function authenticate(req, res) {
    memberService.authenticate(req.body.membername, req.body.password, req.body.token)
    .then(function (member) {
        if (member) {
            //authentication successful
            res.send(member);
        }else{
            //authentication failed
            res.status(400).send('Member or password is incorrect');
        }
    })
    .catch(function (err) {
        res.status(400).send(err);
    });
}

function register(req, res) {
    memberService.create(req.body)
    .then(function (member) {
        if (member) {
            res.send(member);
        } else {
            res.status(400).send('register failed');
        }
        
    })
    .catch(function (err) {
        res.status(400).send(err);
    });
}

function getAll(req, res) {
    memberService.getAll()
    .then(function (members) {
        res.send(members);
    })
    .catch(function (err) {
        res.status(400).send(err);
    });
}

function getCurrent(req,res) {
    memberService.getById(req.member.sub)
    .then(function (member) {
        if (member) {
            res.send(member);
        }else{
            res.sendStatus(400);
        }
    })
    .catch(function (err) {
        res.status(400).send(err);
    });
}

function update(req, res) {
    memberService.update(req.params._id, req.body)
    .then(function () {
         res.json('success');
    })
    .catch(function (err) {
        res.status(400).send(err);
    });
}

function _delete(req, res) {
    memberService.delete(req.params._id)
    .then(function () {
         res.json('success');
    })
    .catch(function (err) {
        res.status(400).send(err);
    });
}