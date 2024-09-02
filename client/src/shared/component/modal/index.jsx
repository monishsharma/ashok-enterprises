import PropTypes from 'prop-types'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

const ModalWrapper = ({
    show,
    title,
    onSave,
    children,
    isDisabled = false,
    handleClose,
    saveButtonText = 'Save',
    ...rest
}) => {
  return (
      <Modal  show={show} onHide={handleClose} {...rest}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {children}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Close</Button>
          <Button className='customBtn' disabled={isDisabled} onClick={onSave}>{saveButtonText}</Button>
        </Modal.Footer>
      </Modal>
  )
}

ModalWrapper.propTypes = {
    show: PropTypes.bool,
    title: PropTypes.string,
    onSave: PropTypes.func,
    children: PropTypes.any,
    isDisabled: PropTypes.bool,
    handleClose: PropTypes.func,
    saveButtonText:PropTypes.string
}

export default ModalWrapper;