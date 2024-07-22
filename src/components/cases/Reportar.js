import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../auth/AuthContext';
import { obtenerTodos } from '../../services/public/DelitoService';
import { crear } from '../../services/private/CasoService';
import Swal from 'sweetalert2';
import { messages } from '../../utils/messages';
import MapEdit from '../maps/MapEdit';
import { Spinner, Button, Form, Alert, Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Reportar() {

  const today = (o) => {
    var now = new Date();
    var d = String(now.getDate()).padStart(2, '0');
    var m = String(now.getMonth() + 1).padStart(2, '0');
    var y = now.getFullYear() - o;
    now = y + '-' + m + '-' + d;
    return now;
  };

  const [loading, setLoading] = useState(false);

  // Obtener el usuario del contexto
  const { user } = useContext(AuthContext);

  const [delitos, setDelitos] = useState([]);

  const [errors, setErrors] = useState({
    mapa: '',
    descripcion: '',
    delito: ''
  });

  const [caso, setCaso] = useState({
    fecha_hora: '',
    latitud: 0,
    longitud: 0,
    altitud: 0,
    descripcion: '',
    url_mapa: '',
    rmi_url: '',
    delito_id: 0,
    user_id: user ? user.id : 0 // Agregar el ID del usuario
  });

  useEffect(() => {
    async function cargarDelitos() {
      const response = await obtenerTodos();
      const body = await response.data;
      setDelitos(body);
    }
    cargarDelitos();
  }, []);

  const _onClickMap = (e, mapSt) => {
    const location = { lat: e.lat, lng: e.lng };
    setCaso({
      ...caso,
      latitud: location.lat,
      longitud: location.lng,
      rmi_url: mapSt.rmiUrl,
      url_mapa: mapSt.mapUrl
    });
  };

  const handleValidation = () => {
    let errors = {};
    let isValid = true;
    if (!caso.descripcion) {
      isValid = false;
      errors.descripcion = "Descripción requerida";
    }
    if (caso.fecha_hora > today(0)) {
      errors.fecha_hora = "No puede ser mayor a hoy";
    }
    if (!caso.url_mapa) {
      isValid = false;
      errors.mapa = "Ubique un punto en el mapa";
    }
    if (!caso.delito_id) {
      isValid = false;
      errors.delito_id = "Seleccione delito";
    }
    setErrors(errors);
    return isValid;
  };

  const sendRegister = (e) => {
    e.preventDefault();
    if (handleValidation()) {
      setLoading(true);
      crear(caso)
        .then(r => {
          console.log(r);
          setCaso({
            fecha_hora: '',
            latitud: 0,
            longitud: 0,
            altitud: 0,
            descripcion: '',
            url_mapa: '',
            rmi_url: '',
            delito_id: 0,
            user_id: user ? user.id : 0
          });
          setLoading(false);
          return Swal.fire('OK', messages.REG_EXITOSO, 'success');
        })
        .catch(e => {
          setLoading(false);
          console.log(e);
          return Swal.fire('Error', messages.ERROR_REGISTRO_CASO, 'error');
        });
    }
  };

  const handleChange = (e) => {
    setCaso({
      ...caso,
      [e.target.name]: e.target.value
    });
  };

  const handleChangeDelito = (e) => {
    setCaso({
      ...caso,
      delito_id: e.target.value
    });
  };

  const [controls] = useState({
    maxDate: today(0)
  });

  return (
    <Container className="d-flex flex-column min-vh-100 py-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6} className="mb-4">
          <h4 className="text-center mb-4">Reportar Caso</h4>
          <Form noValidate onSubmit={sendRegister}>
            <Form.Group className="mb-4" controlId="fecha_hora">
              <Form.Label>Fecha del suceso <span className="text-muted">*</span></Form.Label>
              <Form.Control
                min={controls.maxDate}
                type="datetime-local"
                name="fecha_hora"
                value={caso.fecha_hora}
                onChange={handleChange}
                isInvalid={!!errors.fecha_hora}
              />
              <Form.Control.Feedback type="invalid">
                {errors.fecha_hora}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Ubicación en el mapa <span className="text-muted">*</span></Form.Label>
              <div className="map-container mb-3">
                <MapEdit onClickMap={_onClickMap} />
              </div>
              {errors.mapa && <Alert variant="danger">{errors.mapa}</Alert>}
            </Form.Group>

            <Row className="mb-4">
              <Col md={6}>
                <Form.Group controlId="delito_id">
                  <Form.Label>Delito <span className="text-muted">*</span></Form.Label>
                  <Form.Control
                    as="select"
                    name="delito_id"
                    value={caso.delito_id}
                    onChange={handleChangeDelito}
                    isInvalid={!!errors.delito_id}
                  >
                    <option value=""> -- Selecciona delito -- </option>
                    {delitos.map((d) => (
                      <option key={d.id} value={d.id}>{d.nombre}</option>
                    ))}
                  </Form.Control>
                  <Form.Control.Feedback type="invalid">
                    {errors.delito_id}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="descripcion">
                  <Form.Label>Descripción <span className="text-muted">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Descripción breve"
                    name="descripcion"
                    value={caso.descripcion}
                    onChange={handleChange}
                    isInvalid={!!errors.descripcion}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.descripcion}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Button
              className="d-block mx-auto mb-3"
              variant="primary"
              type="submit"
              disabled={loading}
            >
              {loading && (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              )}
              {' '}
              Enviar
            </Button>
          </Form>
        </Col>
      </Row>

  
    </Container>
  );
}
