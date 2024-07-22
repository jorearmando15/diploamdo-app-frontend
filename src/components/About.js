// src/components/About.js
import React from 'react';
import Card from './ui/Card';
import { Container, Row, Col } from 'react-bootstrap';
import '../index.css'; // Asegúrate de importar el CSS para estilos adicionales

// Simulación de datos
const cardsContent = [
    {
        id: 1,
        title: '¿Quiénes somos?',
        texto: 'HelmeIUD nace para combatir la violencia, los hechos que no son noticia y quedan impunes...',
        subtitle: 'HelmeIUD',
        src: 'https://www.iudigital.edu.co/images/Noticias/2024/Boletin_19/Danilo%20y%20su%20familia.webp'
    },
    {
        id: 2,
        title: 'Proyecto',
        texto: 'Ayudar en comunidad a estar prevenidos por la ola de violencia que asota la ciudad en los distintos sitios...',
        subtitle: 'Unidos somos más',
        src: 'https://www.iudigital.edu.co/images/Noticias/2024/Boletin_17/Banner_Alexandra.webp'
    },
    {
        id: 3,
        title: 'Tu mejor opcion',
        texto: 'Este evento que dejó sembradas las semillas de la óptica y de la astronomía en Puerto....',
        subtitle: 'HelmeIUD',
        src: 'https://www.iudigital.edu.co/images/Noticias/2024/Boletin_15/BannerNoticia.webp'
    },
    {
        id: 4,
        title: 'Un dia diferente',
        texto: 'A Manuela Rodríguez le gusta el verde fresco y brillante que envuelve a Marinilla porque... ',
        subtitle: 'Unidos somos más',
        src: 'https://www.iudigital.edu.co/images/Noticias/2024/Boletn_6_GenteIUD/Home_ManuelaRodriguez.webp#joomlaImage://local-images/Noticias/2024/Boletn_6_GenteIUD/Home_ManuelaRodriguez.webp?width=3840&height=2160'
    }
];

export default function About() {
    return (
        <Container className="my-5">
            <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                {cardsContent.map(c => (
                    <Col key={c.id} className="d-flex align-items-stretch">
                        <Card 
                            title={c.title}
                            texto={c.texto}
                            subtitle={c.subtitle}
                            src={c.src}
                        />
                    </Col>
                ))}
            </Row>
        </Container>
    );
}
