import Role from "../models/role.model.js";

const checkMasterActionPermission = (master, action) => {
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

      if (!masterPermissions[action]) {
        return res.status(403).json({ success: false, message: `${action} permission denied for ${master}` });
      };

      next();

    } catch (error) {
      console.error('Authorization error:', error.message);
      res.status(500).json({ success: false, message: `Authorization error: ${error.message}` });
    };
  };
};

export default checkMasterActionPermission;