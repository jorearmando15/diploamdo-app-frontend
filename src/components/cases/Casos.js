import React, { useContext, useRef, useEffect, useState } from 'react';
import { AuthContext } from '../../auth/AuthContext';
import NoAuthorized from '../ui/NoAuthorized';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { axiosConfig } from '../../config/axiosConfig';
import { Spinner, Button, Table, Alert, Modal, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';

export default function Casos() {
    const { isAdmin } = useContext(AuthContext);
    const tableRef = useRef();
    const [casos, setCasos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editCaso, setEditCaso] = useState(null);

    // Estado para el modal de confirmación de eliminación
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteCasoId, setDeleteCasoId] = useState(null);

    useEffect(() => {
        if (isAdmin) {
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.error('No token found');
                return;
            }

            axiosConfig.get('/casos')
                .then(response => {
                    if (Array.isArray(response.data)) {
                        setCasos(response.data);
                    } else {
                        console.error('La respuesta del servidor no es un array:', response.data);
                        setCasos([]);
                    }
                })
                .catch(error => {
                    console.error('Error al obtener casos:', error);
                    setError('Error al obtener casos. Inténtelo de nuevo más tarde.');
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
                pdf.save("casos.pdf");
            }).catch(error => {
                console.error('Error al generar el PDF:', error);
                Swal.fire('Error', 'No se pudo generar el PDF.', 'error');
            });
        } else {
            Swal.fire('Error', 'No se pudo encontrar la tabla para imprimir.', 'error');
        }
    };

    const confirmDelete = (id) => {
        setDeleteCasoId(id);
        setShowDeleteModal(true);
    };

    const handleDelete = (id) => {
        axiosConfig.delete(`/casos/${id}`)
            .then(() => {
                setCasos(casos.filter(caso => caso.id !== id));
                Swal.fire('Eliminado', 'Caso eliminado con éxito', 'success');
            })
            .catch(error => {
                console.error('Error al eliminar caso:', error);
                Swal.fire('Error', 'No se pudo eliminar el caso', 'error');
            });
    };

    const handleEditCaso = () => {
        axiosConfig.put(`/casos/${editCaso.id}`, editCaso)
            .then(response => {
                setCasos(casos.map(caso => caso.id === editCaso.id ? response.data : caso));
                setShowEditModal(false);
                Swal.fire('OK', 'Caso actualizado con éxito', 'success');
            })
            .catch(error => {
                console.error('Error al actualizar caso:', error);
                Swal.fire('Error', 'Error al actualizar caso', 'error');
            });
    };

    const openEditModal = (caso) => {
        setEditCaso(caso);
        setShowEditModal(true);
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
                                            <th scope="col">Fecha y Hora</th>
                                            <th scope="col">Latitud</th>
                                            <th scope="col">Longitud</th>
                                            <th scope="col">Visible</th>
                                            <th scope="col">Descripción</th>
                                            <th scope="col">URL</th>
                                            <th scope="col">Agregado por</th>
                                            <th scope="col">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {casos.length ? casos.map(caso => (
                                            <tr key={caso.id}>
                                                <td>{new Date(caso.fechaHora).toLocaleString()}</td>
                                                <td>{caso.latitud}</td>
                                                <td>{caso.longitud}</td>
                                                <td>{caso.visible ? 'Sí' : 'No'}</td>
                                                <td>{caso.descripcion}</td>
                                                <td><a href={caso.urlMapa} target="_blank" rel="noopener noreferrer">Ver Mapa</a></td>
                                                <td>{caso.username || 'Desconocido'}</td>
                                                <td>
                                                    <Button 
                                                        variant="outline-warning" 
                                                        size="sm"
                                                        title="Editar"
                                                        onClick={() => openEditModal(caso)}
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </Button>
                                                    <Button 
                                                        variant="outline-danger" 
                                                        size="sm"
                                                        title="Eliminar"
                                                        onClick={() => confirmDelete(caso.id)}
                                                        className="ms-2"
                                                    >
                                                        <i className="fas fa-trash-alt"></i>
                                                    </Button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="8" className="text-center">No hay casos disponibles</td>
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
                                    className="ms-2"
                                    href='http://localhost:3000/private/report'
                                >
                                    <i className="fas fa-plus"></i> Crear Caso
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <NoAuthorized />
            )}

            {editCaso && (
                <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Editar Caso</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group controlId="formEditFechaHora">
                                <Form.Label>Fecha y Hora</Form.Label>
                                <Form.Control 
                                    type="datetime-local"
                                    value={editCaso.fechaHora}
                                    onChange={(e) => setEditCaso({ ...editCaso, fechaHora: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group controlId="formEditLatitud" className="mt-3">
                                <Form.Label>Latitud</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    placeholder="Ingrese la latitud"
                                    value={editCaso.latitud}
                                    onChange={(e) => setEditCaso({ ...editCaso, latitud: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group controlId="formEditLongitud" className="mt-3">
                                <Form.Label>Longitud</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    placeholder="Ingrese la longitud"
                                    value={editCaso.longitud}
                                    onChange={(e) => setEditCaso({ ...editCaso, longitud: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group controlId="formEditVisible" className="mt-3">
                                <Form.Check 
                                    type="checkbox"
                                    label="Visible"
                                    checked={editCaso.visible}
                                    onChange={(e) => setEditCaso({ ...editCaso, visible: e.target.checked })}
                                />
                            </Form.Group>
                            <Form.Group controlId="formEditDescripcion" className="mt-3">
                                <Form.Label>Descripción</Form.Label>
                                <Form.Control 
                                    as="textarea" 
                                    rows={3} 
                                    placeholder="Ingrese la descripción del caso"
                                    value={editCaso.descripcion}
                                    onChange={(e) => setEditCaso({ ...editCaso, descripcion: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group controlId="formEditUrlMapa" className="mt-3">
                                <Form.Label>URL del Mapa</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    placeholder="Ingrese la URL del mapa"
                                    value={editCaso.urlMapa}
                                    onChange={(e) => setEditCaso({ ...editCaso, urlMapa: e.target.value })}
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                            Cancelar
                        </Button>
                        <Button variant="primary" onClick={handleEditCaso}>
                            Guardar Cambios
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}

            {deleteCasoId && (
                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirmar Eliminación</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        ¿Está seguro de que desea eliminar este caso?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                            Cancelar
                        </Button>
                        <Button 
                            variant="danger" 
                            onClick={() => {
                                handleDelete(deleteCasoId);
                                setShowDeleteModal(false);
                            }}
                        >
                            Eliminar
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
}
