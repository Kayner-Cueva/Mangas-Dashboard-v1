import styled, { keyframes } from 'styled-components'
import { theme } from '../../theme/theme'

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

const SpinnerWrapper = styled.div`
  display: inline-block;
  width: ${props => props.size || '20px'};
  height: ${props => props.size || '20px'};
  border: 2px solid ${props => props.color || 'rgba(255, 255, 255, 0.3)'};
  border-radius: 50%;
  border-top-color: ${props => props.topColor || '#fff'};
  animation: ${rotate} 0.8s linear infinite;
`

export const LoadingSpinner = ({ size, color, topColor }) => (
    <SpinnerWrapper size={size} color={color} topColor={topColor} />
)
