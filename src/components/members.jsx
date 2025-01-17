import React, { useState, useEffect } from "react";
import { addMemberService, fetchMembers } from "../services/services";
import { useLanguage } from '../context/LanguageContext';
import { getFieldLabels } from '../utils/labels';

function Members() {
    const [members, setMembers] = useState([]); // Ensure it's initialized as an array
    const [parentName, setParentName] = useState("");
    const [kidName, setKidName] = useState("");
    const [email, setEmail] = useState("");
    const [showAddMember, setShowAddMember] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [errors, setErrors] = useState({}); // Initialize error state
    const [successMessage, setSuccessMessage] = useState(""); // Initialize success message state
    const { language, toggleLanguage, direction } = useLanguage();
    const LABELS = getFieldLabels(language);

    const validateForm = () => {
        const newErrors = {};
        if (!parentName.trim()) newErrors.parentName = LABELS.error_parent_name_required;
        if (!kidName.trim()) newErrors.kidName = LABELS.error_kid_name_required;
        if (!email.trim()) {
            newErrors.email = LABELS.error_email_required;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = LABELS.error_email_invalid;
        }
        setErrors(newErrors); // Update error messages
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!validateForm()) return; // Stop if validation fails

        try {
            await addMemberService({ parent_name: parentName, kid_name: kidName, email });
            setParentName("");
            setKidName("");
            setEmail("");
            setErrors({});
            setSuccessMessage(LABELS.success_member_added); // Show success message
            await loadMembers(); // Refresh the members list
        } catch (error) {
            console.error("Error adding member:", error);
            setSuccessMessage(""); // Reset success message on failure
        }
    };


    // Fetch members from the backend
    const loadMembers = async () => {
        try {
            const data = await fetchMembers();
            if (Array.isArray(data)) {
                setMembers(data); // Ensure only arrays are set
            } else {
                console.error("Unexpected response format:", data);
                setMembers([]); // Reset to empty array if data is invalid
            }
        } catch (error) {
            console.error("Failed to load members:", error);
            setMembers([]); // Reset to empty array on error
        }
    };

    useEffect(() => {
        loadMembers();
    }, []);

    // Filter members based on the search term
    const filteredMembers = Array.isArray(members)
        ? members.filter((member) =>
            member.parent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.kid_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    return (
        <div className="w-full max-w-md mx-auto">
            <button
                className="w-12 h-12 flex items-center justify-center rounded-full border border-teal-500 bg-white text-teal-500 shadow-md absolute top-4 left-4"
                onClick={toggleLanguage}
            >
                {language === 'en' ? 'HE' : 'EN'}
            </button>
            <h1 className="text-xl font-semibold mb-4">{LABELS.members_list_title}</h1>

            <button
                onClick={() => setShowAddMember(!showAddMember)}
                className="w-full bg-blue-500 text-white font-semibold py-2 rounded-md hover:bg-blue-600 transition mb-4"
            >
                {showAddMember ? `- ${LABELS.close_add_member_button}` : `+ ${LABELS.add_member_button}`}
            </button>

            {/* Add Member Form */}
            {showAddMember && (
                <form onSubmit={handleAddMember} className="mb-4">
                    <input
                        type="text"
                        placeholder={LABELS.parent_name_placeholder}
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                        className="input mb-2 w-full border border-gray-300 rounded-md py-2 px-4"
                    />
                    {errors.parentName && <p className="text-red-500 text-sm">{errors.parentName}</p>}

                    <input
                        type="text"
                        placeholder={LABELS.kid_name_placeholder}
                        value={kidName}
                        onChange={(e) => setKidName(e.target.value)}
                        className="input mb-2 w-full border border-gray-300 rounded-md py-2 px-4"
                    />
                    {errors.kidName && <p className="text-red-500 text-sm">{errors.kidName}</p>}

                    <input
                        type="email"
                        placeholder={LABELS.email_placeholder}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input mb-2 w-full border border-gray-300 rounded-md py-2 px-4"
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

                    <button
                        type="submit"
                        className="w-full bg-green-500 text-white font-semibold py-2 rounded-md hover:bg-green-600 transition"
                    >
                        {LABELS.add_member_button}
                    </button>

                    {successMessage && <p className="text-green-500 text-sm mt-2">{successMessage}</p>}
                </form>
            )}

            {/* Search Bar */}
            <input
                type="text"
                placeholder={LABELS.search_placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input w-full border border-gray-300 rounded-md py-2 px-4 mb-4"
            />

            {/* Member List */}
            <div dir={direction}>
                <div className="overflow-y-auto max-h-96 border-t pt-4">
                    {filteredMembers.length > 0 ? (
                        filteredMembers.map((member) => (
                            <div key={member.id} className="bg-gray-50 shadow-sm rounded-lg p-4 mb-2">
                                <h2 className="font-bold text-gray-800">{LABELS.parent_name_label}: {member.parent_name}</h2>
                                <p className="text-sm text-gray-500">{LABELS.kid_name_label}: {member.kid_name}</p>
                                <p className="text-sm text-gray-500">{LABELS.email_label}: {member.email}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">{filteredMembers.length === 0 && LABELS.no_members_found}</p>
                    )}
                </div>
            </div>
        </div>
        );}

            export default Members;
