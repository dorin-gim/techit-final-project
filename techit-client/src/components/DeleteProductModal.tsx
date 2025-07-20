import { FunctionComponent, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { deleteProduct } from "../services/productsService";

interface DeleteProductModalProps {
  show: boolean;
  onHide: Function;
  refresh: Function;
  productId: string;
}

const DeleteProductModal: FunctionComponent<DeleteProductModalProps> = ({
  show,
  onHide,
  refresh,
  productId,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProduct(productId);
      onHide();
      refresh();
      alert("המוצר נמחק בהצלחה!");
    } catch (error: any) {
      const errorMessage = error.response?.data || "שגיאה במחיקת המוצר";
      alert(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Modal
        show={show}
        onHide={() => onHide()}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            <i className="fas fa-trash text-danger me-2"></i>
            מחיקת מוצר
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center py-3">
            <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
            <h5>האם אתה בטוח שברצונך למחוק את המוצר?</h5>
            <p className="text-muted">פעולה זו אינה ניתנת לביטול</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                מוחק...
              </>
            ) : (
              <>
                <i className="fas fa-trash me-2"></i>
                מחק
              </>
            )}
          </Button>
          <Button
            variant="secondary"
            onClick={() => onHide()}
            disabled={isDeleting}
          >
            <i className="fas fa-times me-2"></i>
            ביטול
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DeleteProductModal;