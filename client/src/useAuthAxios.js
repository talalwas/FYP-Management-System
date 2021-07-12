import axios from "axios";
import useToken from "./useToken";

export default function useAuthAxios() {
  const { token } = useToken();

  return {
    authAxios: axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  };
}
