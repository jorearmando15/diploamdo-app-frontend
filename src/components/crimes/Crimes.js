import React, { useContext, useRef, useEffect, useState } from 'react';
import { AuthContext } from '../../auth/AuthContext';
import NoAuthorized from '../ui/NoAuthorized';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { axiosConfig } from '../../config/axiosConfig';
import { Spinner, Button, Table, Alert, Modal, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';

export default function Crimes() {
    const { isAdmin } = useContext(AuthContext);
    const tableRef = useRef();
    const [delitos, setDelitos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false); // Estado para el modal de eliminación
    const [newDelito, setNewDelito] = useState({ nombre: '', descripcion: '' });
    const [editDelito, setEditDelito] = useState(null);
    const [deleteDelitoId, setDeleteDelitoId] = useState(null); // ID del delito a eliminar

    useEffect(() => {
        if (isAdmin) {
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.error('No token found');
                return;
            }

            axiosConfig.get('/delitos')
                .then(response => {
                    if (Array.isArray(response.data)) {
                        setDelitos(response.data);
                    } else {
                        console.error('La respuesta del servidor no es un array:', response.data);
                        setDelitos([]);
                    }
                })
                .catch(error => {
                    console.error('Error al obtener delitos:', error);
                    setError('Error al obtener delitos. Inténtelo de nuevo más tarde.');
                })
                .finally(() => setLoading(false));
        }
    }, [isAdmin]);

    const print = () => {
        if (tableRef.current) {
            html2canvas(tableRef.current).then(canvas => {
                const pdf = new jsPDF("p", "mm", "a4");
                const imgData = canvas.toDataURL('image/png');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save("delitos.pdf");
            }).catch(error => {
                console.error('Error al generar el PDF:', error);
                Swal.fire('Error', 'No se pudo generar el PDF.', 'error');
            });
        } else {
            Swal.fire('Error', 'No se pudo encontrar la tabla para imprimir.', 'error');
        }
    };

    const handleDelete = () => {
        if (deleteDelitoId) {
            axiosConfig.delete(`/delitos/${deleteDelitoId}`)
                .then(() => {
                    setDelitos(delitos.filter(delito => delito.id !== deleteDelitoId));
                    setShowDeleteModal(false);
                    Swal.fire('Eliminado', 'Delito eliminado con éxito', 'success');
                })
                .catch(error => {
                    console.error('Error al eliminar delito:', error);
                    Swal.fire('Error', 'No se pudo eliminar el delito', 'error');
                });
        }
    };

    const handleCreateDelito = () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error('No token found');
            return;
        }

        axiosConfig.post('/delitos', newDelito)
            .then(response => {
                setDelitos([...delitos, response.data]);
                setShowCreateModal(false);
                Swal.fire('OK', 'Delito creado con éxito', 'success');
                setNewDelito({ nombre: '', descripcion: '' });
            })
            .catch(error => {
                console.error('Error al crear delito:', error);
                Swal.fire('Error', 'Error al crear delito', 'error');
            });
    };

    const handleEditDelito = () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error('No token found');
            return;
        }

        axiosConfig.put(`/delitos/${editDelito.id}`, editDelito)
            .then(response => {
                setDelitos(delitos.map(delito => delito.id === editDelito.id ? response.data : delito));
                setShowEditModal(false);
                Swal.fire('OK', 'Delito actualizado con éxito', 'success');
            })
            .catch(error => {
                console.error('Error al actualizar delito:', error);
                Swal.fire('Error', 'Error al actualizar delito', 'error');
            });
    };

    const openEditModal = (delito) => {
        setEditDelito(delito);
        setShowEditModal(true);
    };

    const openDeleteModal = (id) => {
        setDeleteDelitoId(id);
        setShowDeleteModal(true);
    };

    return (
        <>
            {isAdmin ? (
                <div className="container mt-4">
                    {loading ? (
                        <div className="text-center">
                            <Spinner animation="border" variant="primary" />
                        </div>
                    ) : error ? (
                        <Alert variant="danger">
                            {error}
                        </Alert>
                    ) : (
                        <>
                            <div className="table-responsive mb-3">
                                <Table striped bordered hover ref={tableRef}>
                                    <thead>
                                        <tr>
                                            <th scope="col">Nombre</th>
                                            <th scope="col">Descripción</th>
                                            <th scope="col">Agregado por</th>
                                            <th scope="col">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {delitos.length ? delitos.map(delito => (
                                            <tr key={delito.id}>
                                                <td>{delito.nombre}</td>
                                                <td>{delito.descripcion}</td>
                                                <td>
                                                    {delito.usuario && delito.usuario.nombre && delito.usuario.apellido
                                                        ? `${delito.usuario.nombre} ${delito.usuario.apellido}`
                                                        : 'Desconocido'}
                                                </td>
                                                <td>
                                                    <Button 
                                                        variant="outline-warning" 
                                                        size="sm"
                                                        title="Editar"
                                                        onClick={() => openEditModal(delito)}
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </Button>
                                                    <Button 
                                                        variant="outline-danger" 
                                                        size="sm"
                                                        title="Eliminar"
                                                        onClick={() => openDeleteModal(delito.id)}
                                                        className="ms-2"
                                                    >
                                                        <i className="fas fa-trash-alt"></i>
                                                    </Button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="text-center">No hay delitos disponibles</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                            <div className="text-center mt-3">
                                <Button 
                                    variant="outline-primary"
                                    title="Imprimir PDF"
                                    onClick={print}
                                >
                                    <i className="fas fa-print"></i> Imprimir PDF
                                </Button>
                                <Button 
                                    variant="outline-success" 
                                    title="Crear"
                                    onClick={() => setShowCreateModal(true)}
                                    className="ms-2"
                                >
                                    <i className="fas fa-plus"></i> Crear Delito
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <NoAuthorized />
            )}

            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Crear Delito</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formNombre">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Ingrese el nombre del delito"
                                value={newDelito.nombre}
                                onChange={(e) => setNewDelito({ ...newDelito, nombre: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formDescripcion" className="mt-3">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={3} 
                                placeholder="Ingrese la descripción del delito"
                                value={newDelito.descripcion}
                                onChange={(e) => setNewDelito({ ...newDelito, descripcion: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleCreateDelito}>
                        Crear Delito
                    </Button>
                </Modal.Footer>
            </Modal>

            {editDelito && (
                <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Editar Delito</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group controlId="formEditNombre">
                                <Form.Label>Nombre</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    placeholder="Ingrese el nombre del delito"
                                    value={editDelito.nombre}
                                    onChange={(e) => setEditDelito({ ...editDelito, nombre: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group controlId="formEditDescripcion" className="mt-3">
                                <Form.Label>Descripción</Form.Label>
                                <Form.Control 
                                    as="textarea" 
                                    rows={3} 
                                    placeholder="Ingrese la descripción del delito"
                                    value={editDelito.descripcion}
                                    onChange={(e) => setEditDelito({ ...editDelito, descripcion: e.target.value })}
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                            Cancelar
                        </Button>
                        <Button variant="primary" onClick={handleEditDelito}>
                            Guardar Cambios
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Eliminar Delito</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¿Está seguro de que desea eliminar este delito?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
