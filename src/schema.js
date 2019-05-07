const mongoose = require('mongoose')
require('mongoose-int32')
require('@mongoosejs/double')
const timestamps = ['created_at', 'updated_at']

const helpers = function (schema) {
    schema.query['page'] = function (page, limit) {
        page = typeof page === 'number' && page > 0 ? page : 1
        limit = typeof limit === 'number' && limit > 0 ? limit : 10
        return this.skip((page - 1) * limit).limit(limit)
    }
}

const Base = (model, fields, options = {}) => {
    const schema = new mongoose.Schema(fields, Object.assign({
        timestamps: {
            createdAt: timestamps[0],
            updatedAt: timestamps[1]
        }
    }, options))
    helpers(schema)
    if (!schema.options.toJSON) {
        schema.options.toJSON = {}
    }
    if (!schema.options.toJSON.virtuals) {
        schema.options.toJSON.virtuals = true
    }
    if (!schema.options.toJSON.getters) {
        schema.options.toJSON.getters = true
    }
    const originTransform = schema.options.toJSON.transform
    schema.options.toJSON.transform = (doc, ret, options) => {
        if (originTransform) {
            ret = originTransform(doc, ret, options)
        }
        timestamps.forEach((timestamp) => {
            if (ret[timestamp] && ret[timestamp] instanceof Date) {
                ret[timestamp] = parseInt(ret[timestamp].getTime() / 1000)
            }
        })
        delete ret.__v
        delete ret._id
        return ret
    }
    if (model && typeof model === 'string') {
        return mongoose.model(model, schema)
    } else {
        return schema
    }
}

Base.ObjectId = mongoose.Schema.Types.ObjectId
Base.Decimal128 = mongoose.Schema.Types.Decimal128
Base.Int32 = mongoose.Schema.Types.Int32
Base.Double = mongoose.Schema.Types.Double

module.exports = Base