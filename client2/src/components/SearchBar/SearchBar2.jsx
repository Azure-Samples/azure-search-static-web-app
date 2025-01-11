import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Grid2 from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { debounce } from '@mui/material/utils';
import fetchWithAuth from '../../authorized-fetch';

const autocompleteService = { current: null };

export default function SearchWithSuggest(props) {

    let [q, setQ] = useState("");
    let [suggestions, setSuggestions] = useState([]);
    let [showSuggestions, setShowSuggestions] = useState(false);

    async function suggest(q, top, suggester){
        
        if(typeof q !== 'string' || q.trim().length === 0){
            setSuggestions([]);
            return;
        }

        fetchWithAuth('/api/suggest',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                    q: q,
                    top: 5,
                    suggester: 'sg'
            
            })
        })
        .then(response => {
            setSuggestions(response.suggestions);
        } )
        .catch(error => {
            console.log(error);
            setSuggestions([]);
        });
    }
    const fetchSuggestions = React.useMemo(
        () => debounce((query) => {
        suggest(query, 5, 'sg');
    }, 300));

    const onSearchHandler = () => {
        console.log("searching for: " + q);
        props.postSearchHandler(q);
        setShowSuggestions(false);
    }

    const suggestionClickHandler = (s) => {
        document.getElementById("search-box").value = s;
        setShowSuggestions(false);
        props.postSearchHandler(s);    
    }

    const onEnterButton = (event) => {
        if (event.keyCode === 13) {
            console.log("Enter key pressed");
            onSearchHandler();
        }
    }

    const onChangeHandler = () => {
        var searchTerm = document.getElementById("search-box").value;
        setShowSuggestions(true);
        setQ(searchTerm);

        // use this prop if you want to make the search more reactive
        if (props.searchChangeHandler) {
            props.searchChangeHandler(searchTerm);
        }
    }

    useEffect(() => {
        fetchSuggestions(q);
        return () => {
            debouncedSuggest.clear();
        };
    }, [q, props]);


      return (
        <Autocomplete
          sx={{ width: 300 }}
          filterOptions={(x) => x}
          options={suggestions}
          onChange={(event, newValue) => {

            console.log(`onChange`,newValue);

            setSuggestions(newValue ? [newValue, ...options] : options);
            setValue(newValue);
          }}
          onInputChange={(event, newInputValue) => {

            console.log(`onInputChange`,newValue);

            setInputValue(newInputValue);
          }}
          renderInput={(params) => (
            <TextField {...params} label="Add a location" fullWidth />
          )}
        />
      );
}