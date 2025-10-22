import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import Layout from '../components/Layout';
import { Plus, X, Pencil, Trash2, Loader2, Dumbbell } from 'lucide-react';
import type { WorkoutTemplate, Exercise } from '../../shared/types';

const blankExercise: Exercise = { exercise_name: "", name: "", sets: 3, reps: 10, weight: 0, weight_kg: 0 };

export default function WorkoutTemplates() {
    const { user } = useAuth();
    const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState<WorkoutTemplate | null>(null);
    const [currentExercises, setCurrentExercises] = useState<Exercise[]>([blankExercise]);
    const [templateData, setTemplateData] = useState({ name: '', description: '' });

    useEffect(() => {
        if (user) {
            fetchTemplates();
        }
    }, [user]);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/api/templates", { withCredentials: true });
            setTemplates(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Failed to fetch templates:", error);
            setTemplates([]);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (template: WorkoutTemplate | null = null) => {
        setIsEditing(template);
        if (template) {
            setTemplateData({ name: template.name, description: template.description || '' });
            setCurrentExercises(template.exercises && template.exercises.length > 0 ? template.exercises.map(ex => ({...ex})) : [blankExercise]);
        } else {
            setTemplateData({ name: '', description: '' });
            setCurrentExercises([blankExercise]);
        }
        setShowModal(true);
    };

    const handleDataChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setTemplateData(prev => ({ ...prev, [name]: value }));
    };

    const handleExerciseChange = (index: number, field: keyof Exercise, value: string | number) => {
        const newExercises = [...currentExercises];
        const exercise = { ...newExercises[index], [field]: value };
        if (field === 'exercise_name') exercise.name = value as string;
        if (field === 'name') exercise.exercise_name = value as string;
        newExercises[index] = exercise;
        setCurrentExercises(newExercises);
    };

    const addExerciseField = () => {
        setCurrentExercises(prev => [...prev, { ...blankExercise }]);
    };

    const removeExerciseField = (index: number) => {
        setCurrentExercises(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const finalTemplateData = {
            ...templateData,
            exercises: currentExercises.filter(ex => ex.exercise_name || ex.name)
        };

        try {
            if (isEditing) {
                await axios.put(`/api/templates/${isEditing._id}`, finalTemplateData, { withCredentials: true });
            } else {
                await axios.post("/api/templates", finalTemplateData, { withCredentials: true });
            }
            fetchTemplates();
            setShowModal(false);
        } catch (error) {
            console.error("Failed to save template:", error);
        }
    };

    const deleteTemplate = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this template?")) {
            try {
                await axios.delete(`/api/templates/${id}`, { withCredentials: true });
                setTemplates(prev => prev.filter(t => t._id !== id));
            } catch (error) {
                console.error("Failed to delete template:", error);
            }
        }
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Workout Templates</h1>
                        <p className="text-gray-600 mt-2">Create and manage your reusable workout plans.</p>
                    </div>
                    <button onClick={() => openModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                        <Plus className="h-5 w-5" />
                        <span>New Template</span>
                    </button>
                </div>

                {loading && <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin h-12 w-12 text-blue-600" /></div>}
                
                {!loading && templates.length === 0 && (
                     <div className="text-center py-16 bg-white rounded-xl border"><Dumbbell className="h-16 w-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-semibold text-gray-900 mb-2">No templates yet</h3><p className="text-gray-600 mb-6">Create your first workout template to get started.</p><button onClick={() => openModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">Create a Template</button></div>
                )}

                {!loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(Array.isArray(templates) ? templates : []).map(template => (
                            <div key={template._id} className="bg-white rounded-xl shadow-sm border p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                                        <p className="text-sm text-gray-500">{template.description}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button onClick={() => openModal(template)} className="text-gray-400 hover:text-blue-600"><Pencil className="h-4 w-4" /></button>
                                        <button onClick={() => deleteTemplate(template._id)} className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                </div>
                                {Array.isArray(template.exercises) && template.exercises.length > 0 && (
                                    <div className="mt-4 border-t pt-4">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Exercises:</h4>
                                        <ul className="space-y-1 text-xs text-gray-600">
                                            {template.exercises.slice(0, 3).map((ex, i) => <li key={i}>{ex.exercise_name}</li>)}
                                            {template.exercises.length > 3 && <li>...and {template.exercises.length - 3} more</li>}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b pb-3 mb-4">
                            <h2 className="text-2xl font-semibold">{isEditing ? "Edit Template" : "New Template"}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-800"><X className="h-6 w-6" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="text" name="name" required value={templateData.name} onChange={handleDataChange} className="w-full border rounded-lg px-3 py-2" placeholder="Template Name (e.g., Push Day)"/>
                            <textarea name="description" value={templateData.description} onChange={handleDataChange} className="w-full border rounded-lg px-3 py-2" placeholder="Description (e.g., Strength)"/>
                            <div className="mt-6 border-t pt-4 space-y-4">
                                <h3 className="text-lg font-semibold">Exercises</h3>
                                {currentExercises.map((ex, i) => (
                                    <div key={i} className="grid grid-cols-5 gap-2 items-center">
                                        <input type="text" value={ex.exercise_name || ''} onChange={(e) => handleExerciseChange(i, "exercise_name", e.target.value)} className="col-span-5 border rounded-lg px-3 py-2" placeholder="Exercise Name"/>
                                        <input type="number" value={ex.sets || ''} onChange={(e) => handleExerciseChange(i, "sets", parseInt(e.target.value))} className="w-full border rounded-lg px-3 py-2" placeholder="Sets"/>
                                        <input type="number" value={ex.reps || ''} onChange={(e) => handleExerciseChange(i, "reps", parseInt(e.target.value))} className="w-full border rounded-lg px-3 py-2" placeholder="Reps"/>
                                        <input type="number" value={ex.weight || ''} onChange={(e) => handleExerciseChange(i, "weight", parseInt(e.target.value))} className="w-full border rounded-lg px-3 py-2" placeholder="kg"/>
                                        <button type="button" onClick={() => removeExerciseField(i)} className="text-red-500 hover:text-red-700 justify-self-end"><Trash2 className="h-5 w-5"/></button>
                                    </div>
                                ))}
                                <button type="button" onClick={addExerciseField} className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"><Plus className="h-5 w-5"/><span>Add Exercise</span></button>
                            </div>
                            <div className="flex space-x-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg">Cancel</button>
                                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg">{isEditing ? "Save Changes" : "Create Template"}</button>
                            </div>
                        </form>
                    </div>
                 </div>
            )}
        </Layout>
    );
}