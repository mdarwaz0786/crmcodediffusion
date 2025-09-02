import Role from "../models/role.model.js";

const checkMasterActionPermission = (master, action) => {
  return async (req, res, next) => {
    try {
      const roleId = req.team?.role?._id;
      const role = await Role.findById(roleId);

      if (!role) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      };

      const masterPermissions = role.permissions[master];

      if (!masterPermissions) {
        return res.status(403).json({ success: false, message: `No permission found for ${master}` });
      };

      if (!masterPermissions[action]) {
        return res.status(403).json({ success: false, message: `${action} permission denied for ${master}` });
      };

      next();

    } catch (error) {
      return res.status(500).json({ success: false, message: `Authorization error: ${error.message}` });
    };
  };
};

export default checkMasterActionPermission;