import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * 이 컴포넌트는 UI를 렌더링하지 않습니다.
 * /login 경로로 접근했을 때, 로그인 모달을 띄우고
 * 즉시 홈페이지로 리다이렉트시키는 역할만 합니다.
 */
const LoginTriggerPage = () => {
  const { openLoginModal } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // 1. 로그인 모달을 엽니다.
    openLoginModal();
    // 2. 홈페이지로 리다이렉트합니다.
    // 'replace: true' 옵션으로 브라우저 히스토리에 /login을 남기지 않습니다.
    navigate('/', { replace: true });
  }, [openLoginModal, navigate]); // useEffect의 의존성 배열에 함수들을 포함합니다.

  // 리다이렉트되는 동안 아무것도 렌더링하지 않습니다.
  return null;
};

export default LoginTriggerPage;