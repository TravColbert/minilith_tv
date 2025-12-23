const { DataTypes } = require('sequelize');

module.exports = function (app) {
  const Job = app.locals.db.define('Job', {
    command: {
      comment: [
        "The command to be executed by the job",
        "Examples: 'rescan', 'tmdb-lookup', etc."
      ],
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Command cannot be empty"
        },
        len: {
          args: [1, 50],
          msg: "Command must be between 1 and 50 characters"
        }
      }
    },
    status: {
      comment: [
        "The current status of the job",
        "Examples: 'pending', 'in-progress', 'completed', 'failed'"
      ],
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: {
          args: [['pending', 'in-progress', 'completed', 'failed']],
          msg: "Status must be one of: pending, in-progress, completed, failed"
        }
      }
    },
    payload: {
      comment: [
        "A JSON string representing any additional data needed for the job",
        "This can include parameters or options specific to the command"
      ],
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isJson(value) {
          if (value) {
            try {
              JSON.parse(value);
            } catch (e) {
              throw new Error("Payload must be a valid JSON string");
            }
          }
        }
      }
    }
  });

  return Job;
}
