const SystemConfig = require('../models/SystemConfig');

exports.getConfig = async (req, res) => {
    try {
        let config = await SystemConfig.findOne();
        if (!config) {
            config = new SystemConfig();
            await config.save();
        }
        res.json(config);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching config' });
    }
};

exports.updateConfig = async (req, res) => {
    try {
        let config = await SystemConfig.findOne();
        if (!config) {
             config = new SystemConfig();
        }
        
        // Update fields safely
        if(req.body.globalSpeed !== undefined) config.globalSpeed = req.body.globalSpeed;
        if(req.body.basePrices) config.basePrices = { ...config.basePrices, ...req.body.basePrices };
        if(req.body.availableVehicles) config.availableVehicles = req.body.availableVehicles;

        await config.save();
        res.json(config);
    } catch (err) {
        res.status(500).json({ message: 'Error updating config', error: err.message });
    }
};
