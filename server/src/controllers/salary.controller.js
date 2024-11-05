import Salary from '../models/salary.model.js'; 

// Create a new salary record
export const createSalary = async (req, res) => {
    try {
        const salary = new Salary(req.body);
        await salary.save();
        res.status(201).json(salary);
    } catch (error) {
        res.status(400).json({ message: error.message });
    };
};

// Fetch all salary records
export const fetchAllSalary = async (req, res) => {
    try {
        const salaries = await Salary.find().populate('employee');
        res.status(200).json(salaries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    };
};

// Fetch a salary record by ID
export const fetchSingleSalary = async (req, res) => {
    try {
        const salary = await Salary.findById(req.params.id).populate('employee');
        if (!salary) return res.status(404).json({ message: 'Salary record not found' });
        res.status(200).json(salary);
    } catch (error) {
        res.status(500).json({ message: error.message });
    };
};

// Update a salary record by ID
export const updateSalary = async (req, res) => {
    try {
        const salary = await Salary.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!salary) return res.status(404).json({ message: 'Salary record not found' });
        res.status(200).json(salary);
    } catch (error) {
        res.status(400).json({ message: error.message });
    };
};

// Delete a salary record by ID
export const deleteSalary = async (req, res) => {
    try {
        const salary = await Salary.findByIdAndDelete(req.params.id);
        if (!salary) return res.status(404).json({ message: 'Salary record not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    };
};
