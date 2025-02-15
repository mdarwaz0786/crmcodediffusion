import Role from "../models/role.model.js";

const checkFieldUpdatePermission = (master, fields) => {
  return async (req, res, next) => {
    try {
      const teamRole = req.team.role;
      const role = await Role.findById(teamRole._id);

      if (!role) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      };

      const masterPermissions = role.permissions[master];

      if (!masterPermissions) {
        return res.status(403).json({ success: false, message: `No permission found for ${master}` });
      };

      const fieldsBeingUpdated = Object.keys(req.body);
      const fieldsToCheck = fields.length > 0 ? fields : fieldsBeingUpdated;

      // Create an object to store fields that are allowed to be updated
      const allowedUpdates = {};

      // Check if field is being updated
      for (const field of fieldsToCheck) {
        if (fieldsBeingUpdated.includes(field)) {
          const fieldPermissions = masterPermissions.fields[field];

          if (!fieldPermissions) {
            return res.status(403).json({ success: false, message: `No field permissions found for ${field}` });
          };

          // Allow updating if permissions are correct
          if (fieldPermissions.read === false && fieldPermissions.show === true) {
            allowedUpdates[field] = req.body[field];
          } else {
            return res.status(403).json({ success: false, message: `Update permission denied for field ${field}` });
          };
        };
      };

      // Override the request body with allowed updates only
      req.body = allowedUpdates;

      next();

    } catch (error) {
      console.log('Authorization error:', error.message);
      return res.status(500).json({ success: false, message: `Authorization error: ${error.message}` });
    };
  };
};

export default checkFieldUpdatePermission;
