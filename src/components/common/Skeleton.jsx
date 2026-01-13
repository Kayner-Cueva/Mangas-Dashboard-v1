import styled, { keyframes } from 'styled-components'
import { theme } from '../../theme/theme'

const skeletonKeyframes = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`

export const SkeletonBase = styled.div`
  display: inline-block;
  height: ${props => props.height || '1rem'};
  width: ${props => props.width || '100%'};
  border-radius: ${props => props.$borderRadius || theme.borderRadius.sm};
  background-color: ${theme.colors.bg.light};
  background-image: linear-gradient(
    90deg,
    ${theme.colors.bg.light} 0px,
    ${theme.colors.bg.card} 40px,
    ${theme.colors.bg.light} 80px
  );
  background-size: 200px 100%;
  background-repeat: no-repeat;
  animation: ${skeletonKeyframes} 1.5s infinite linear;
`

export const SkeletonCircle = styled(SkeletonBase)`
  border-radius: 50%;
  width: ${props => props.size || '3rem'};
  height: ${props => props.size || '3rem'};
`

export const SkeletonRect = styled(SkeletonBase)`
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '100%'};
`
