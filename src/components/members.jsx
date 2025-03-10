import React, { useState, useEffect } from "react";
import { addMemberService, fetchMembers, fetchMemberLoans, updateMemberService, deleteMemberService } from "../services/services";
import { useLanguage } from '../context/LanguageContext';
import { getFieldLabels } from '../utils/labels';
import { Edit, Trash2, Info } from 'lucide-react';

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
    const [editingMemberId, setEditingMemberId] = useState(null);
    const [expandedMemberId, setExpandedMemberId] = useState(null);
    const [memberLoans, setMemberLoans] = useState({});



    const validateForm = () => {
        const newErrors = {};
        if (!parentName.trim()) newErrors.parentName = LABELS.error_parent_name_required;
        if (!kidName.trim()) newErrors.kidName = LABELS.error_kid_name_required;
        if (email.trim() && !/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = LABELS.error_email_invalid;
        }
        setErrors(newErrors); // Update error messages
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!validateForm()) return; // Stop if validation fails
        // Show warning if no email
        if (!email.trim()) {
            alert(LABELS.email_missing_warning);
        }

        try {
            const memberData = { parent_name: parentName, kid_name: kidName, email };

            if (editingMemberId) {
                await updateMemberService(editingMemberId, memberData);
            } else {
                await addMemberService(memberData);
            }

            // Reset form
            setEditingMemberId(null);
            setParentName("");
            setKidName("");
            setEmail("");
            setErrors({});
            setSuccessMessage(editingMemberId ? LABELS.success_member_updated : LABELS.success_member_added);
            await loadMembers();
        } catch (error) {
            console.error("Error saving member:", error);
            setSuccessMessage("");
        }
    };

    const handleDeleteMember = async (id) => {
        if (window.confirm(LABELS.confirm_delete_member)) {
            try {
                await deleteMemberService(id);
                setSuccessMessage(LABELS.success_member_deleted);
                await loadMembers();
            } catch (error) {
                console.error("Error deleting member:", error);
                // You can update the UI to display an error message
                alert("Cannot delete member: they have open loans.");
            }
        }
    };

    const handleEditMember = (member) => {
        setEditingMemberId(member.id);
        setParentName(member.parent_name);
        setKidName(member.kid_name);
        setEmail(member.email);
        setShowAddMember(true);
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

    const toggleMemberDetails = async (memberId) => {
        if (expandedMemberId === memberId) {
            setExpandedMemberId(null);
        } else {
            setExpandedMemberId(memberId);
            if (!memberLoans[memberId]) {
                try {
                    const loans = await fetchMemberLoans(memberId);
                    setMemberLoans(prev => ({ ...prev, [memberId]: loans }));
                } catch (error) {
                    console.error("Error fetching loans:", error);
                }
            }
        }
    };

    // Step 1: Filter members based on the search term
    const filteredMembers = Array.isArray(members)
        ? members.filter((member) =>
            member.parent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.kid_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    // Step 2: Sort members so those who borrowed more than 2 books appear first
    const sortedMembers = [...filteredMembers].sort((a, b) => {
        const aBooks = a.borrowed_books_count || 0;
        const bBooks = b.borrowed_books_count || 0;

        if (aBooks > 2 && bBooks <= 2) return -1; // Move 'a' to the top
        if (bBooks > 2 && aBooks <= 2) return 1;  // Move 'b' to the top
        return 0;
    });

    return (
        <div className="w-full max-w-md mx-auto">
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
                className={`input w-full border border-gray-300 rounded-md py-2 px-4 mb-4 ${language === 'he' ? 'text-right' : 'text-left'} ${language === 'he' ? 'rtl' : 'ltr'}`}
            />

            {/* Member List */}
            <div dir={direction}>
                <div className="overflow-y-auto max-h-96 border-t pt-4">
                    {sortedMembers.map((member) => (
                        <div key={member.id} className="bg-gray-50 shadow-sm rounded-lg p-4 mb-2 relative">
                            <div className="mb-4">
                                <h2 className="font-bold text-gray-800">{LABELS.parent_name_label}: {member.parent_name}</h2>
                                <p className="text-sm text-gray-500">{LABELS.kid_name_label}: {member.kid_name}</p>
                                <p className="text-sm mb-2  text-gray-500">{LABELS.email_label}: {member.email || LABELS.no_email_provided}</p>
                                <p className={`text-sm mb-2 mt-2 font-semibold ${member.borrowed_books_count > 2 ? "text-red-500" : "text-gray-700"}`}>{LABELS.borrowed_books_label}: {member.borrowed_books_count}</p>

                                {expandedMemberId === member.id && memberLoans[member.id] && (
                                    <div className="mt-2 p-2 bg-gray-100 rounded">
                                        <h3 className="font-semibold text-gray-700">{LABELS.borrowed_books_label}</h3>
                                        <ul>
                                            {memberLoans[member.id].map((loan, index) => (
                                                <li key={index} className="text-sm text-gray-600">
                                                    - {loan.book_title} ({LABELS.borrow_date}: {new Date(loan.borrowed_at).toLocaleDateString()})
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="absolute bottom-4 inset-x-4 flex justify-between items-center">
                                <div className="flex gap-2">
                                    {member.borrowed_books_count > 0 ? (
                                        <button
                                            onClick={() => alert(LABELS.cannot_delete_with_borrowed_books)}
                                            className="text-gray-400 cursor-not-allowed relative"
                                            aria-label={LABELS.cannot_delete_with_borrowed_books}
                                        >
                                            <Trash2 size={20}/>
                                            {/* Add diagonal line over the trash icon */}
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="w-[28px] h-[2px] bg-gray-400 rotate-45 absolute"></div>
                                            </div>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleDeleteMember(member.id)}
                                            className="text-gray-600 hover:text-red-600 transition-colors duration-200"
                                            aria-label={LABELS.delete_member}
                                        >
                                            <Trash2 size={20}/>
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleEditMember(member)}
                                        className="text-gray-600 hover:text-emerald-600 transition-colors duration-200"
                                        aria-label={LABELS.edit_member}
                                    >
                                        <Edit size={20}/>
                                    </button>

                                    {/* Only show the info button if there are borrowed books */}
                                    {member.borrowed_books_count > 0 && (
                                        <button
                                            onClick={() => toggleMemberDetails(member.id)}
                                            className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
                                            aria-label={LABELS.More_Details}
                                        >
                                            <Info size={20}/>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Members;
