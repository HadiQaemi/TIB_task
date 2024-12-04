import axios from 'axios';
import { SERVER_ADDRESS } from '../constants/configs';

export const paperServices = {
    search: async (title) => {
        let res = await axios.get(SERVER_ADDRESS + `/api/search?title=${encodeURIComponent(title)}`)
            .then(response => {
                return response.data;
            })
            .catch(error => {
                console.error(error);
            });
        return res
    },
    getTypeInfo: async (nodeKey) => {
        let res = await fetch(`https://typeregistry.lab.pidconsortium.net/objects/21.T11969/${nodeKey}`)
            .then(response => {
                return response;
            })
            .catch(error => {
                console.error(error);
            });
        return res
    },
    getStatements: async (currentPage, pageSize) => {
        let res = await axios.get(SERVER_ADDRESS + `/api/query-data?currentPage=${encodeURIComponent(currentPage)}&pageSize=${encodeURIComponent(pageSize)}`)
            .then(response => {
                return response.data;
            })
            .catch(error => {
                console.error(error);
            });
        return res
    },
    searchStatements: async (queryData) => {
        const api = axios.create({
            baseURL: SERVER_ADDRESS,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const defaultParams = {
            timeRange: {
                start: 2000,
                end: 2025
            },
            authors: [],
            journals: [],
            concepts: []
        };

        const response = await api.post('/api/filter-statement',
            queryData || defaultParams
        );
        return response.data
    },
    getList: async () => {
        let res = await axios.get(SERVER_ADDRESS + '/api/all_paper')
            .then(response => {
                return response.data;
            })
            .catch(error => {
                console.error(error);
            });
        return res
    },
    getPaper: async (data) => {
        let res = await axios.get(SERVER_ADDRESS + '/api/paper?id=' + data, { id: data })
            .then(response => {
                return response.data;
            })
            .catch(error => {
                console.error(error);
            });
        return res
    },
    getAuthors: async (data) => {
        let res = await axios.get(SERVER_ADDRESS + '/api/authors?name=' + data, { name: data })
            .then(response => {
                return response.data;
            })
            .catch(error => {
                console.error(error);
            });
        return res
    },
    getTitles: async (data) => {
        let res = await axios.get(SERVER_ADDRESS + '/api/titles?title=' + data, { name: data })
            .then(response => {
                return response.data;
            })
            .catch(error => {
                console.error(error);
            });
        return res
    },
    getResearchFields: async (data) => {
        let res = await axios.get(SERVER_ADDRESS + '/api/research_fields?label=' + data, { name: data })
            .then(response => {
                return response.data;
            })
            .catch(error => {
                console.error(error);
            });
        return res
    },
    getConcepts: async (data) => {
        let res = await axios.get(SERVER_ADDRESS + '/api/concepts?name=' + data, { name: data })
            .then(response => {
                return response.data;
            })
            .catch(error => {
                console.error(error);
            });
        return res
    },
    getJournals: async (data) => {
        let res = await axios.get(SERVER_ADDRESS + '/api/journals?name=' + data, { name: data })
            .then(response => {
                return response.data;
            })
            .catch(error => {
                console.error(error);
            });
        return res
    },
    getStatement: async (data) => {
        let res = await axios.get(SERVER_ADDRESS + '/api/statement?id=' + data, { id: data })
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
