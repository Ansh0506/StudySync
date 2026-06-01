import './ConfirmModal.css';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Delete" }) => {
    if (!isOpen) return null;

    return (
        <div className="custom-modal-overlay" onClick={onCancel}>
            {/* stopPropagation prevents clicking the background from closing the modal if they click inside the box */}
            <div className="custom-modal-content" onClick={(e) => e.stopPropagation()}>
                
                <div className="custom-modal-header">
                    <div className="custom-modal-icon">
                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="custom-modal-title">{title}</h3>
                </div>
                
                <div className="custom-modal-body">
                    <p>{message}</p>
                </div>
                
                <div className="custom-modal-actions">
                    <button className="custom-modal-btn cancel" onClick={onCancel}>
                        Cancel
                    </button>
                    <button className="custom-modal-btn danger" onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
