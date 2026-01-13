import styled from 'styled-components'
import { theme } from '../../theme/theme'
import { Card } from '../../components/common/Card'

const Container = styled.div`
  padding: ${theme.spacing.xl};
  max-width: 800px;
  margin: 0 auto;
`

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xl};
`

const Section = styled.section`
  margin-bottom: ${theme.spacing.xl};
`

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.md};
`

const Text = styled.p`
  color: ${theme.colors.text.secondary};
  line-height: 1.6;
  margin-bottom: ${theme.spacing.md};
`

const DMCA = () => {
    return (
        <Container>
            <Title>DMCA & Copyright</Title>
            <Card>
                <Section>
                    <SectionTitle>Política de Derechos de Autor</SectionTitle>
                    <Text>
                        Manga Dashboard respeta los derechos de propiedad intelectual de otros y espera que sus usuarios hagan lo mismo.
                        De acuerdo con la Digital Millennium Copyright Act (DMCA), responderemos rápidamente a las notificaciones de
                        presuntas infracciones de derechos de autor.
                    </Text>
                </Section>

                <Section>
                    <SectionTitle>Notificación de Infracción</SectionTitle>
                    <Text>
                        Si usted es un propietario de derechos de autor o un agente del mismo y cree que cualquier contenido
                        en nuestra plataforma infringe sus derechos, puede enviar una notificación por escrito a nuestro
                        agente de derechos de autor con la siguiente información:
                    </Text>
                    <ul style={{ color: theme.colors.text.secondary, paddingLeft: theme.spacing.xl }}>
                        <li>Una firma física o electrónica de la persona autorizada para actuar en nombre del propietario.</li>
                        <li>Identificación del trabajo protegido por derechos de autor que se alega ha sido infringido.</li>
                        <li>Identificación del material que se alega que infringe y que debe ser eliminado.</li>
                        <li>Información de contacto (dirección, teléfono, email).</li>
                        <li>Una declaración de que usted tiene una creencia de buena fe de que el uso del material no está autorizado.</li>
                        <li>Una declaración de que la información en la notificación es exacta, bajo pena de perjurio.</li>
                    </ul>
                </Section>

                <Section>
                    <SectionTitle>Contacto</SectionTitle>
                    <Text>
                        Para cualquier consulta relacionada con DMCA, por favor contáctenos en: <strong>legal@mangas-dashboard.com</strong>
                    </Text>
                </Section>
            </Card>
        </Container>
    )
}

export default DMCA
