const mongoose = require('mongoose');

const AdminRoleSchema = mongoose.Schema({
    key_role: {
        type: String,
        enum: ['master', 'staff'],
        default: 'staff'
    },
    name: String,
    description: String,
    no_change: {
        type: Boolean,
        default: false
    },
    permissions: [String]
}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
            delete ret.__v;
            return ret;
        }
    }
});

module.exports = mongoose.model('adminrole', AdminRoleSchema);
