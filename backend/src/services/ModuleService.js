const ModuleModel = require('../models/ModuleModel');

class ModuleService {
    static async getModulesBySubject(subjectId) {
        return await ModuleModel.findAllBySubjectId(subjectId);
    }

    static async getModuleById(id) {
        const module = await ModuleModel.findById(id);
        if (!module) throw new Error('Module not found');
        return module;
    }

    static async createModule(data) {
        return await ModuleModel.create(data);
    }
    static async updateModule(id, data) {
        const module = await ModuleModel.update(id, data);
        if (!module) throw new Error('Module not found');
        return module;
    }

    static async deleteModule(id) {
        const module = await ModuleModel.delete(id);
        if (!module) throw new Error('Module not found');
        return { message: 'Module deleted' };
    }
}

module.exports = ModuleService;
