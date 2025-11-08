import React, { useState } from "react";
import "@/pages/Profile.css"; // 确保此CSS文件存在并已链接

// 辅助函数：格式化日期为 "Mon YYYY" (例如 "Sep 2013")
const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        // 检查日期是否有效，避免无效日期如 "Invalid Date"
        if (isNaN(date.getTime())) return dateString;

        const options = { year: 'numeric', month: 'short' };
        return date.toLocaleDateString('en-US', options);
    } catch (e) {
        console.error("Error formatting date:", e);
        return dateString; // 发生错误时返回原始字符串
    }
};

// 辅助数组，用于生成月份和年份下拉菜单选项
const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (v, i) => currentYear - i); // 从当前年份往前回溯100年

const ProfilePage = () => {
    // --- 状态管理 ---
    // 个人信息状态
    const [personalInfo, setPersonalInfo] = useState({
        firstName: "Alice",
        lastName: "Smith",
        preferredName: "Lili",
        timezone: "EST",
        title: "Software Engineer",
        company: "Circlecat",
        linkedin: "https://www.linkedin.com/in/alice-smith",
        emails: [
            {
                id: 1,
                email: "alice@example.com",
                isPrimary: true,
                isContact: true
            },
            {
                id: 2,
                email: "alice.alt@example.com",
                isPrimary: false,
                isContact: false
            },
        ],
        preferredCommunication: "Email",
        completedTraining: ["Training 1", "Training 2"],
    });
    const [showPersonalEditModal, setShowPersonalEditModal] = useState(false);
    const [editingPersonalInfo, setEditingPersonalInfo] = useState({}); // 用于表单数据
    const [isTechOnly, setIsTechOnly] = useState(false);

    // 工作经验状态 - 修改结构
    const [experienceList, setExperienceList] = useState([
        {
            id: 1, // 唯一ID，用于React的key prop和编辑
            title: "Software Engineer",
            company: "Circle Cat",
            startMonth: "September",
            startYear: "2024",
            endMonth: "",
            endYear: "",
            isCurrentlyWorking: true, // 新增字段
        },
        {
            id: 2,
            title: "Interns",
            company: "Circle Cat",
            startMonth: "September",
            startYear: "2019",
            endMonth: "February",
            endYear: "2020",
            isCurrentlyWorking: false, // 新增字段
        },
    ]);
    const [showExperienceEditModal, setShowExperienceEditModal] = useState(false);
    const [currentEditingExperienceList, setCurrentEditingExperienceList] = useState([]); // 用于模态框表单

    // 教育经历状态 - **修改结构**
    const [educationList, setEducationList] = useState([
        {
            id: 1,
            institution: "A University",
            degree: "Bachelor",
            field: "Computer Science",
            startMonth: "September", // 修改为 Month
            startYear: "2013",   // 修改为 Year
            endMonth: "June",     // 修改为 Month
            endYear: "2017",      // 修改为 Year
        },
        {
            id: 2,
            institution: "B University",
            degree: "Master",
            field: "Computer Science",
            startMonth: "September",
            startYear: "2017",
            endMonth: "June",
            endYear: "2019",
        },
    ]);
    const [showEducationEditModal, setShowEducationEditModal] = useState(false);
    const [currentEditingEducationList, setCurrentEditingEducationList] = useState([]); // 用于模态框表单

    // --- 事件处理函数 ---

    // 个人信息处理函数
    const handleOpenPersonalEdit = () => {
        setEditingPersonalInfo({
            ...personalInfo,
            emails: personalInfo.emails.map(email => ({ ...email }))
        });
        setShowPersonalEditModal(true);
    };

    const handleClosePersonalEdit = () => {
        setShowPersonalEditModal(false);
    };

    const handlePersonalFormChange = (e) => {
        const { name, value } = e.target;
        if (name === "completedTraining") {
            setEditingPersonalInfo((prev) => ({
                ...prev,
                [name]: value.split(",").map((item) => item.trim()),
            }));
        } else if (name !== "emails") {
            setEditingPersonalInfo((prev) => ({ ...prev, [name]: value }));
        }
    };

    // 邮箱编辑特定处理函数
    const handleEditingEmailChange = (id, value) => {
        setEditingPersonalInfo(prev => ({
            ...prev,
            emails: prev.emails.map(emailItem =>
                emailItem.id === id ? { ...emailItem, email: value } : emailItem
            )
        }));
    };

    // 设置哪个邮箱为联系邮箱 (Contact Email 必须是唯一的)
    const handleSetContactEmail = (id) => {
        setEditingPersonalInfo(prev => ({
            ...prev,
            emails: prev.emails.map(emailItem => ({
                ...emailItem,
                isContact: emailItem.id === id
            }))
        }));
    };

    const handleAddEditingEmail = () => {
        setEditingPersonalInfo(prev => ({
            ...prev,
            emails: [...prev.emails, { id: Date.now(), email: "", isPrimary: false, isContact: false }],
        }));
    };

    const handleDeleteEditingEmail = (id) => {
        setEditingPersonalInfo(prev => {
            const emailToDelete = prev.emails.find(item => item.id === id);
            if (emailToDelete && emailToDelete.isPrimary) {
                alert("Primary email cannot be deleted.");
                return prev;
            }

            let newEmails = prev.emails.filter(emailItem => emailItem.id !== id);

            if (emailToDelete.isContact && newEmails.length > 0) {
                const firstAvailableEmail = newEmails.find(item => !item.isPrimary);
                if (firstAvailableEmail) {
                    firstAvailableEmail.isContact = true;
                } else if (newEmails.length > 0) {
                    newEmails[0].isContact = true;
                }
            } else if (emailToDelete.isContact && newEmails.length === 0) {
                // Handle case where last contact email is deleted,
                // in a real app, you might want to force selection of a new one or show error.
            }

            return {
                ...prev,
                emails: newEmails,
            };
        });
    };

    const handleSavePersonalEdit = () => {
        const cleanedEmails = editingPersonalInfo.emails.filter(emailItem =>
            emailItem.isPrimary || emailItem.email.trim() !== ""
        );

        let finalEmails = [...cleanedEmails];
        const hasContactEmail = finalEmails.some(email => email.isContact);
        if (!hasContactEmail && finalEmails.length > 0) {
            const candidateContact = finalEmails.find(email => !email.isPrimary) || finalEmails[0];
            if (candidateContact) {
                candidateContact.isContact = true;
            }
        } else if (hasContactEmail) {
            let foundContact = false;
            finalEmails = finalEmails.map(email => {
                if (email.isContact && !foundContact) {
                    foundContact = true;
                    return email;
                }
                return { ...email, isContact: false };
            });
        }

        setPersonalInfo({ ...editingPersonalInfo, emails: finalEmails });
        setShowPersonalEditModal(false);
    };

    // 工作经验处理函数
    const handleOpenExperienceEdit = () => {
        setCurrentEditingExperienceList(experienceList.map(item => ({ ...item })));
        setShowExperienceEditModal(true);
    };

    const handleCloseExperienceEdit = () => {
        setShowExperienceEditModal(false);
    };

    // 修改 handleExperienceItemChange 以处理新的日期和复选框字段
    const handleExperienceItemChange = (id, field, value) => {
        setCurrentEditingExperienceList(prevList =>
            prevList.map(item => {
                if (item.id === id) {
                    // 如果是 isCurrentlyWorking 字段，则根据其值清空或设置 endDate
                    if (field === "isCurrentlyWorking") {
                        return {
                            ...item,
                            [field]: value,
                            endMonth: value ? "" : item.endMonth, // 如果选中，清空结束月份
                            endYear: value ? "" : item.endYear,   // 如果选中，清空结束年份
                        };
                    }
                    return { ...item, [field]: value };
                }
                return item;
            })
        );
    };

    // 修改 handleAddExperienceItem 以初始化新的字段
    const handleAddExperienceItem = () => {
        setCurrentEditingExperienceList((prev) => [
            ...prev,
            {
                id: Date.now(),
                title: "",
                company: "",
                startMonth: "",
                startYear: "",
                endMonth: "",
                endYear: "",
                isCurrentlyWorking: false,
            },
        ]);
    };

    const handleDeleteExperienceItem = (id) => {
        setCurrentEditingExperienceList((prev) =>
            prev.filter((item) => item.id !== id)
        );
    };

    // 修改 handleSaveExperienceEdit 的过滤条件，以匹配新的字段结构
    const handleSaveExperienceEdit = () => {
        setExperienceList(currentEditingExperienceList.filter(item =>
            item.title || item.company || item.startMonth || item.startYear || item.endMonth || item.endYear || item.isCurrentlyWorking
        ));
        setShowExperienceEditModal(false);
    };


    // 教育经历处理函数
    const handleOpenEducationEdit = () => {
        // 深拷贝 educationList
        setCurrentEditingEducationList(educationList.map(item => ({ ...item })));
        setShowEducationEditModal(true);
    };

    const handleCloseEducationEdit = () => {
        setShowEducationEditModal(false);
    };

    // **修改 handleEducationItemChange 以处理 startMonth, startYear, endMonth, endYear**
    const handleEducationItemChange = (id, field, value) => {
        const updatedList = currentEditingEducationList.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        );
        setCurrentEditingEducationList(updatedList);
    };

    // **修改 handleAddEducationItem 以初始化 startMonth, startYear, endMonth, endYear**
    const handleAddEducationItem = () => {
        setCurrentEditingEducationList((prev) => [
            ...prev,
            {
                id: Date.now(),
                institution: "",
                degree: "",
                field: "",
                startMonth: "",
                startYear: "",
                endMonth: "",
                endYear: ""
            },
        ]);
    };

    const handleDeleteEducationItem = (id) => {
        setCurrentEditingEducationList((prev) =>
            prev.filter((item) => item.id !== id)
        );
    };

    // **修改 handleSaveEducationEdit 的过滤条件**
    const handleSaveEducationEdit = () => {
        setEducationList(currentEditingEducationList.filter(item =>
            item.institution || item.degree || item.field || item.startMonth || item.startYear || item.endMonth || item.endYear
        ));
        setShowEducationEditModal(false);
    };

    // 简单格式化 YYYY-MM-DD -> MMM YYYY，例如 2013-09-01 -> Sep 2013
    // 已经有 formatDateForDisplay 在顶部，这里不再重复定义。


    // 新增辅助函数：格式化工作经验的显示时长
    const formatExperienceDuration = (startMonth, startYear, endMonth, endYear, isCurrentlyWorking) => {
        const start = (startMonth && startYear) ? `${startMonth} ${startYear}` : '';
        if (isCurrentlyWorking) {
            return `${start} - Present`;
        } else if (endMonth && endYear) {
            const end = `${endMonth} ${endYear}`;
            return `${start} - ${end}`;
        }
        return start;
    };

    // **新增辅助函数：格式化教育经历的显示时长**
    const formatEducationDuration = (startMonth, startYear, endMonth, endYear) => {
        const start = (startMonth && startYear) ? `${startMonth} ${startYear}` : '';
        const end = (endMonth && endYear) ? `${endMonth} ${endYear}` : '';

        if (start && end) {
            return `${start} - ${end}`;
        } else if (start) {
            return start;
        } else if (end) {
            return end;
        }
        return '';
    };


    return (
        <div className="profile-page-container">
            <div className="profile-content-area">
                <div className="profile-info-section">
                    <div className="user-details">
                        <h1 className="user-name">
                            <span>
                                {personalInfo.firstName}
                                {personalInfo.preferredName
                                    ? ` (${personalInfo.preferredName})`
                                    : ""}
                                {` ${personalInfo.lastName}`}
                                <span className="user-timezone">{personalInfo.timezone}</span>
                            </span>
                            <button
                                className="edit-name-button"
                                aria-label="Edit Name"
                                onClick={handleOpenPersonalEdit}
                            >
                                Edit Profile
                            </button>
                        </h1>
                        <p className="user-title">
                            {personalInfo.title} <span className="at-company">at {personalInfo.company}</span>
                        </p>
                    </div>
                </div>

                {/* 标签内容 */}
                <div className="tab-content-wrapper">
                    <div className="tab-content-personal">
                        <div className="section">
                            <h3>LinkedIn link</h3>
                            <p className="section-text"><a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer">{personalInfo.linkedin}</a></p>
                        </div>

                        <div className="section">
                            <h3>Email</h3>
                            {personalInfo.emails.map((emailItem) => (
                                <p key={emailItem.id} className="email-display-row section-text">
                                    {emailItem.email}
                                    {emailItem.isPrimary && <span className="email-tag primary">Primary Email</span>}
                                    {emailItem.isContact && <span className="email-tag contact">Contact Email</span>}
                                    {!emailItem.isPrimary && !emailItem.isContact && <span className="email-tag alternative">Alternative Email</span>}
                                </p>
                            ))}
                        </div>

                        <div className="section">
                            <h3>Preferred Communication Method</h3>
                            <p className="section-text">{personalInfo.preferredCommunication}</p>
                        </div>

                        <div className="section">
                            <div className="section-header">
                                <h3>Experience</h3>
                                <button className="edit-button" aria-label="Edit Experience" onClick={handleOpenExperienceEdit}>
                                    +
                                </button>
                            </div>

                            <div className="experience-list">
                                {experienceList.map((exp) => (
                                    <div key={exp.id} className="experience-list-item">
                                        <h6>{exp.title}</h6>
                                        <p>{exp.company}</p>
                                        {/* 修改 Experience 的 Duration 显示 */}
                                        <p className="duration-text">
                                            {formatExperienceDuration(exp.startMonth, exp.startYear, exp.endMonth, exp.endYear, exp.isCurrentlyWorking)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="section">
                            <div className="section-header">
                                <h3>Education</h3>
                                <button className="edit-button" aria-label="Edit Education" onClick={handleOpenEducationEdit}>
                                    +
                                </button>
                            </div>
                            <div className="education-list">
                                {educationList.map((edu) => (
                                    <div key={edu.id} className="education-list-item">
                                        <h6>{edu.institution}</h6>
                                        <p>{edu.degree}'s degree, {edu.field}</p>
                                        {/* **修改 Education 的 Duration 显示** */}
                                        <p className="duration-text">
                                            {formatEducationDuration(edu.startMonth, edu.startYear, edu.endMonth, edu.endYear)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>


                        <div className="section">
                            <h3>Completed Training</h3>
                            {personalInfo.completedTraining.map((training, index) => (
                                <p key={index} className="section-text">{training}</p>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 模态框 --- */}

            {/* 个人信息编辑模态框 (保持不变) */}
            {showPersonalEditModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Edit Personal Information</h2>
                        <form onSubmit={(e) => e.preventDefault()}>
                            <label>
                                First Name:
                                <input
                                    type="text"
                                    name="firstName"
                                    value={editingPersonalInfo.firstName || ""}
                                    onChange={handlePersonalFormChange}
                                />
                            </label>
                            <label>
                                Last Name:
                                <input
                                    type="text"
                                    name="lastName"
                                    value={editingPersonalInfo.lastName || ""}
                                    onChange={handlePersonalFormChange}
                                />
                            </label>
                            <label>
                                Preferred Name:
                                <input
                                    type="text"
                                    name="preferredName"
                                    value={editingPersonalInfo.preferredName || ""}
                                    onChange={handlePersonalFormChange}
                                />
                            </label>
                            <label>
                                Current Timezone:
                                <select
                                    name="timezone"
                                    value={editingPersonalInfo.timezone || ""}
                                    onChange={handlePersonalFormChange}
                                >
                                    <option value="">Select a timezone</option>
                                    <option value="EST">EST (Eastern Standard Time)</option>
                                    <option value="PST">PST (Pacific Standard Time)</option>
                                    <option value="CST_ASIA">CST (China Standard Time)</option>
                                </select>
                            </label>
                            <label>
                                LinkedIn:
                                <input
                                    type="text"
                                    name="linkedin"
                                    value={editingPersonalInfo.linkedin || ""}
                                    onChange={handlePersonalFormChange}
                                />
                            </label>

                            <div className="email-edit-section">
                                <div className="section-header">
                                    <h3>Emails</h3>
                                    <button className="edit-button" aria-label="Edit Experience" onClick={handleAddEditingEmail}>
                                        +
                                    </button>
                                </div>
                                <p className="modal-info-text">
                                    Please select the email for admins to contact you.
                                </p>
                                {editingPersonalInfo.emails && editingPersonalInfo.emails.map((emailItem) => (
                                    <div key={emailItem.id} className="email-edit-item">
                                        <input
                                            type="text"
                                            value={emailItem.email}
                                            onChange={(e) => handleEditingEmailChange(emailItem.id, e.target.value)}
                                            readOnly={emailItem.isPrimary}
                                            disabled={emailItem.isPrimary}
                                            style={emailItem.isPrimary ? { backgroundColor: '#f0f0f0' } : {}}
                                        />
                                        <div className="email-roles-selection">
                                            <label className="role-radio-label">
                                                <input
                                                    type="radio"
                                                    name="contact_email_selection"
                                                    checked={emailItem.isContact}
                                                    onChange={() => handleSetContactEmail(emailItem.id)}
                                                />
                                                Set as Contact
                                            </label>
                                        </div>
                                        {!emailItem.isPrimary && (
                                            <button type="button" className="delete-btn" onClick={() => handleDeleteEditingEmail(emailItem.id)}>-</button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <label>
                                Preferred Communication:
                                <div className="radio-group">
                                    <input
                                        type="radio"
                                        name="preferredCommunication"
                                        value="Email"
                                        checked={editingPersonalInfo.preferredCommunication === "Email"}
                                        onChange={handlePersonalFormChange}
                                    /> Email
                                    <input
                                        type="radio"
                                        name="preferredCommunication"
                                        value="Google Chat"
                                        checked={editingPersonalInfo.preferredCommunication === "Google Chat"}
                                        onChange={handlePersonalFormChange}
                                    /> Google Chat
                                </div>
                            </label>
                            <div className="modal-actions">

                                <button type="button" onClick={handleClosePersonalEdit}>Cancel</button>
                                <button type="button" onClick={handleSavePersonalEdit}>Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 工作经验编辑模态框 (已修改) */}
            {showExperienceEditModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="section-header">
                            <h3>Edit Experience</h3>
                            <button className="edit-button" aria-label="Add New Experience" onClick={handleAddExperienceItem}>
                                +
                            </button>
                        </div>



                        {currentEditingExperienceList.map((item) => (
                            <div key={item.id} className="edit-item-form">
                                {/* Title */}
                                <div className="form-group">
                                    <label htmlFor={`exp-title-${item.id}`}>Title*</label>
                                    <input
                                        id={`exp-title-${item.id}`}
                                        type="text"
                                        value={item.title || ""}
                                        onChange={(e) => handleExperienceItemChange(item.id, "title", e.target.value)}
                                    />
                                </div>

                                {/* Company or organization */}
                                <div className="form-group">
                                    <label htmlFor={`exp-company-${item.id}`}>Company or organization*</label>
                                    <input
                                        id={`exp-company-${item.id}`}
                                        type="text"
                                        value={item.company || ""}
                                        onChange={(e) => handleExperienceItemChange(item.id, "company", e.target.value)}
                                    />
                                </div>

                                {/* I am currently working in this role checkbox */}
                                <div className="form-group-checkbox">
                                    <input
                                        type="checkbox"
                                        id={`current-role-${item.id}-exp`}
                                        checked={!!item.isCurrentlyWorking}
                                        onChange={(e) => handleExperienceItemChange(item.id, "isCurrentlyWorking", e.target.checked)}
                                    />
                                    <label htmlFor={`current-role-${item.id}-exp`}>I am currently working in this role</label>
                                </div>

                                {/* Start date (Month/Year dropdowns) */}
                                <div className="form-group date-group">
                                    <label>Start date*</label>
                                    <div className="date-inputs">
                                        <select
                                            value={item.startMonth || ""}
                                            onChange={(e) => handleExperienceItemChange(item.id, "startMonth", e.target.value)}
                                        >
                                            <option value="">Month</option>
                                            {months.map((month) => (
                                                <option key={month} value={month}>{month}</option>
                                            ))}
                                        </select>
                                        <select
                                            value={item.startYear || ""}
                                            onChange={(e) => handleExperienceItemChange(item.id, "startYear", e.target.value)}
                                        >
                                            <option value="">Year</option>
                                            {years.map((year) => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* End date (Month/Year dropdowns, disabled if currently working) */}
                                <div className="form-group date-group">
                                    <label>End date</label>
                                    <div className="date-inputs">
                                        <select
                                            value={item.endMonth || ""}
                                            onChange={(e) => handleExperienceItemChange(item.id, "endMonth", e.target.value)}
                                            disabled={!!item.isCurrentlyWorking} // 当“I am currently working in this role”被选中时禁用
                                        >
                                            <option value="">Month</option>
                                            {months.map((month) => (
                                                <option key={month} value={month}>{month}</option>
                                            ))}
                                        </select>
                                        <select
                                            value={item.endYear || ""}
                                            onChange={(e) => handleExperienceItemChange(item.id, "endYear", e.target.value)}
                                            disabled={!!item.isCurrentlyWorking} // 当“I am currently working in this role”被选中时禁用
                                        >
                                            <option value="">Year</option>
                                            {years.map((year) => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <button type="button" className="delete-btn" onClick={() => handleDeleteExperienceItem(item.id)}>-</button>
                            </div>

                        ))}
                        {/* Are you transitioning into the tech industry? */}
                        <div className="form-group-checkbox">
                            <input
                                type="checkbox"
                                id="tech-only-checkbox"
                                checked={isTechOnly}
                                onChange={(e) => setIsTechOnly(e.target.checked)}
                            />
                            <label htmlFor="tech-only-checkbox">Are you transitioning into the tech industry?</label>
                        </div>
                        <div className="modal-actions">
                            <button type="button" onClick={handleCloseExperienceEdit}>Cancel</button>
                            <button type="button" onClick={handleSaveExperienceEdit}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* **教育经历编辑模态框 - 修改为月份/年份选择器** */}
            {showEducationEditModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="section-header">
                            <h3>Edit Education</h3>
                            <button className="edit-button" aria-label="Add New Education" onClick={handleAddEducationItem}>
                                +
                            </button>
                        </div>

                        {currentEditingEducationList.map((item) => (
                            <div key={item.id} className="edit-item-form">
                                <div className="form-group">
                                    <label htmlFor={`edu-institution-${item.id}`}>School*</label>
                                    <input
                                        id={`edu-institution-${item.id}`}
                                        type="text"
                                        value={item.institution || ""}
                                        onChange={(e) => handleEducationItemChange(item.id, "institution", e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor={`edu-degree-${item.id}`}>Degree</label>
                                    <select
                                        id={`edu-degree-${item.id}`}
                                        value={item.degree || ""}
                                        onChange={(e) => handleEducationItemChange(item.id, "degree", e.target.value)}
                                    >
                                        <option value="">Select Degree</option>
                                        <option value="Associate">Associate</option>
                                        <option value="Bachelor">Bachelor</option>
                                        <option value="Master">Master</option>
                                        <option value="Doctorate">Doctorate</option>
                                        <option value="Professional">Professional</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor={`edu-field-${item.id}`}>Field of study</label>
                                    <input
                                        id={`edu-field-${item.id}`}
                                        type="text"
                                        value={item.field || ""}
                                        onChange={(e) => handleEducationItemChange(item.id, "field", e.target.value)}
                                    />
                                </div>

                                {/* **Start date (Month/Year dropdowns)** */}
                                <div className="form-group date-group">
                                    <label>Start date*</label>
                                    <div className="date-inputs">
                                        <select
                                            value={item.startMonth || ""}
                                            onChange={(e) => handleEducationItemChange(item.id, "startMonth", e.target.value)}
                                        >
                                            <option value="">Month</option>
                                            {months.map((month) => (
                                                <option key={month} value={month}>{month}</option>
                                            ))}
                                        </select>
                                        <select
                                            value={item.startYear || ""}
                                            onChange={(e) => handleEducationItemChange(item.id, "startYear", e.target.value)}
                                        >
                                            <option value="">Year</option>
                                            {years.map((year) => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* **End date (Month/Year dropdowns)** */}
                                <div className="form-group date-group">
                                    <label>End date</label>
                                    <div className="date-inputs">
                                        <select
                                            value={item.endMonth || ""}
                                            onChange={(e) => handleEducationItemChange(item.id, "endMonth", e.target.value)}
                                        >
                                            <option value="">Month</option>
                                            {months.map((month) => (
                                                <option key={month} value={month}>{month}</option>
                                            ))}
                                        </select>
                                        <select
                                            value={item.endYear || ""}
                                            onChange={(e) => handleEducationItemChange(item.id, "endYear", e.target.value)}
                                        >
                                            <option value="">Year</option>
                                            {years.map((year) => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <button type="button" className="delete-btn" onClick={() => handleDeleteEducationItem(item.id)}>-</button>

                            </div>
                        ))}

                        <div className="modal-actions">
                            <button type="button" onClick={handleCloseEducationEdit}>Cancel</button>
                            <button type="button" onClick={handleSaveEducationEdit}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default ProfilePage;