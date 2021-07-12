import useAuthAxios from "./useAuthAxios";
import useToken from "./useToken";
import jwtDecode from "jwt-decode";

async function getUser(id) {}

export default async function useAppUser() {
  let { token } = useToken();
  const { authAxios } = useAuthAxios();
  if (token) {
    token = jwtDecode(token);
    try {
      return await authAxios.get(`/api/users/${token._id}`);
    } catch (e) {
      console.error(e);
    }
  } else {
    return undefined;
  }
}
