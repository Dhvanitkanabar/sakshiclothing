import mongoose, { Schema } from 'mongoose';

const auditLogSchema = new Schema(
  {
    action: {
      type: String,
      required: true,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'OTHER']
    },
    resource: {
      type: String,
      required: true
    },
    resourceId: {
      type: Schema.Types.Mixed
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    details: {
      type: Schema.Types.Mixed
    },
    ipAddress: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, action: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
