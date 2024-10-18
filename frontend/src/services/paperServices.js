import axios from 'axios';
import { SERVER_ADDRESS } from '../constants/configs';

// Define an object called paperServices that exports four methods:
// getList, getPaper, getPredicate, and getFile.
export const paperServices = {
    search: async (title) => {
        let res = await axios.get(SERVER_ADDRESS + `/search?title=${encodeURIComponent(title)}`)
            .then(response => {
                return response.data;
            })
            .catch(error => {
                console.error(error);
            });
        return res
    },
    getStatements: async () => {
        let res = await axios.get(SERVER_ADDRESS + '/all-statements')
            .then(response => {
                return response.data;
            })
            .catch(error => {
                console.error(error);
            });
        return res
    },
    getList: async () => {
        let res = await axios.get(SERVER_ADDRESS + '/all-paper')
            .then(response => {
                return response.data;
            })
            .catch(error => {
                console.error(error);
            });
        return res
    },
    getPaper: async (data) => {
        let res = await axios.get(SERVER_ADDRESS + '/paper?id=' + data, { id: data })
            .then(response => {
                return response.data;
            })
            .catch(error => {
                console.error(error);
            });
        return res
    },
    getPredicate: async (word) => {
        try {
            const response = await fetch(`https://orkg.org/api/predicates/${word}`);
            const data = await response.json();
            return data.label;
        } catch (error) {
            console.error('Error fetching definition:', error);
            return 'Definition not found';
        }
    },
    getFile: async (url) => {
        try {
            let res = await axios.get(url)
                .then(response => {
                    return response.data;
                })
                .catch(error => {
                    console.error(error);
                });
            return res
        } catch (error) {
            return ""
        }

    },
}
