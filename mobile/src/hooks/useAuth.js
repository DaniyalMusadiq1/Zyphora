import { useDispatch, useSelector } from 'react-redux';
import { logout, setCredentials, setDeviceId, setPhone, setProfile } from '../redux/slices/authSlice';

export function useAuth() {
  const auth = useSelector((s) => s.auth);
  const dispatch = useDispatch();

  return {
    ...auth,
    setCredentials: (payload) => dispatch(setCredentials(payload)),
    setDeviceId: (id) => dispatch(setDeviceId(id)),
    setPhone: (p) => dispatch(setPhone(p)),
    setProfile: (payload) => dispatch(setProfile(payload)),
    logout: () => dispatch(logout()),
  };
}
