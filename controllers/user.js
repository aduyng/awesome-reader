var User = require('../models/user'),
    Store = require('../models/store'),
    Role = require('../models/role'),
    AppError = require('../error'),
    Promise = require('bluebird'),
    StoreUserRole = require('../models/store-user-role'),
    StoreCollection = require('../collections/store'),
    _ = require('underscore'),
    _s = require('underscore.string');

exports.stores = function (req, res, next) {
    StoreCollection.forge()
        .query(function(qb){
            qb.join('StoreUserRole', 'StoreUserRole.storeId', '=', 'Store.id');
            qb.where('StoreUserRole.userId', req.session.userId);
            qb.column('StoreUserRole.roleId');
        })
        .fetch()
        
        .then(function(docs){
            if( docs ){
                res.send(docs.map(function(doc){
                    return doc.pick('id', 'name', 'roleId');
                }));
                return;
            }
            
            res.send(200, []);
        });
};

exports.register = function (req, res, next) {
    if(!/\d{10}/.test(req.body.phone) || !/\d{4}/.test(req.body.pin) || !req.body.name){
        res.send(400);
        return;
    }
    
    //query for the user by that phone number
    User.forge()
    .query(function(qb){
        qb.where('phone', req.body.phone);
    })
    .fetch()
    .then(function(doc){
        if( doc ){
            return Promise.reject();    
        }
        return User.forge(_.extend(_.pick(req.body, 'phone', 'pin', 'name'), {isActive: true}))
            .save();
    })
    .then(function(doc){
        res.send(doc.pick('id', 'name', 'phone', 'pin'));
        return Promise.resolve();
    })
    .catch(function(e){
        res.send(400);
    });
    
};

exports.availability = function (req, res, next) {
    if(!/\d{10}/.test(req.body.phone)){
        res.send(400);
        return;
    }
    
    //query for the user by that phone number
    User.forge()
    .query(function(qb){
        qb.where('phone', req.body.phone);
    })
    .fetch()
    .then(function(doc){
        if( !doc ){
            res.send(200, {valid: true});
            return;
        }
        res.send(200, {valid: false});
    });
};

exports.get = function (req, res, next) {
    User.forge({id:req.params.id})
    .fetch()
    .then(function(doc){
        res.send(doc.pick('name', 'phone', 'address', 'id', 'email', 'ssn'));
    }.bind(this));
};

exports.delete = function(req, res, next){
    //will not allow to delete user for now
    StoreUserRole.forge()
        .query(function(qb){
            qb.where('userId', req.params.id);
            qb.where('storeId', req.session.storeId);
        }.bind(this))
        .fetch()
        .then(function(doc){
            if( !doc ){
                res.send(404);
                return;
            }
            
            return doc.destroy()
                    .then(function(deleted){
                        res.send(200);
                    });
            
        });
    
};

exports.put = function(req, res, next) {
    var user, sur;
    var data = _.pick(req.body, 
            'address', 
            'email', 
            'name', 
            'phone', 
            'ssn');
            
            if( req.body.pin ){
                data.pin = req.body;
            }
            
    return User.forge({id: req.params.id})
    .save(data, {patch: true})
    .then(function(doc) {
        user = doc;
        return StoreUserRole.forge()
            .query(function(qb){
                qb.where('userId', req.params.id);
                qb.where('storeId', req.session.storeId);
            })
            .fetch();
    }.bind(this))
    .then(function(doc){
        sur = doc;
        if( !sur ){
            sur = new StoreUserRole({
                userId: req.params.id,
                storeId: req.session.storeId,
            });
        }
        return sur.save(_.pick(req.body, 
            'cashRatio',
            'commissionRato',
            'salaryWarrantedAmount',
            'isActive',
            'roleId'
        ));
    }.bind(this))
    .then(function(){
        var data = user.pick('name', 'phone', 'address', 'id', 'email', 'ssn');
        data.roleId = sur.get('roleId');
        _.extend(data, sur.pick('commissionRatio', 'cashRatio', 'isActive', 'salaryWarrantedAmount'))
        res.send(data);
    });
};


exports.signIn = function(req, res, next) {
    if (!/\d{10}/.test(req.body.phone) || !/\d{4}/.test(req.body.pin)) {
        throw new AppError({
            code: 400,
            message: 'Phone number or PIN is missing!'
        });
    }

    //delete all cached in session
    delete req.session.userId;
    delete req.session.roleId;
    delete req.session.storeId;

    User.forge({
        phone: req.body.phone
    }).fetch().then(function(doc) {
        if (!doc) {
            throw new AppError({
                code: 404,
                message: 'User with phone number {{phoneNumber}} is not found!',
                placeholders: {
                    phoneNumber: req.body.phone
                }
            });
        }

        if (!doc.get('isActive')) {
            throw new AppError({
                code: 403,
                message: 'User with phone number {{phoneNumber}} is not active!',
                placeholders: {
                    phoneNumber: req.body.phone
                }
            });

        }


        if (parseInt(req.body.pin, 10) !== doc.get('pin')) {
            throw new AppError({
                code: 400,
                message: 'PIN is incorrect'
            });
        }

        req.session.userId = doc.id;
        res.send(200);
    },
    next).catch (next);
};

exports.signOut = function (req, res, next) {
    if (!req.session.userId) {
        res.send(404);
        return;
    }


    delete req.session.userId;
    delete req.session.roleId;
    delete req.session.storeId;
    res.send(200);
};
