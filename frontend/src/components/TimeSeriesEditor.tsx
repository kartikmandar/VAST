import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Tabs,
    Tab,
    TextField,
    Button,
    Divider,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    List,
    ListItem,
    ListItemText,
    SelectChangeEvent,
    Grid,
    FormControlLabel,
    Switch,
    Stack
} from '@mui/material';
import {
    Close as CloseIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon
} from '@mui/icons-material';

interface TimeSeriesEditorProps {
    chartId: number;
    onClose: () => void;
    onSave: () => void;
}

interface SeriesOption {
    id: string;
    label: string;
    color: string;
}

interface FilterCondition {
    id: string;
    expression: string;
}

const TimeSeriesEditor: React.FC<TimeSeriesEditorProps> = ({ chartId, onClose, onSave }) => {
    const [tabValue, setTabValue] = useState<number>(0);
    const [chartTitle, setChartTitle] = useState<string>(`Chart ${chartId}`);
    const [selectedSeries, setSelectedSeries] = useState<string>('alphabet_inc_class_c');
    const [filterMethod, setFilterMethod] = useState<string>('keep');
    const [matchType, setMatchType] = useState<string>('any');
    const [conditions, setConditions] = useState<FilterCondition[]>([
        { id: '1', expression: '> 750' },
        { id: '2', expression: '$C > 500000' }
    ]);

    // Available series options
    const seriesOptions: SeriesOption[] = [
        { id: 'alphabet_inc_class_a', label: 'Alphabet Inc Class A', color: '#3f51b5' },
        { id: 'alphabet_inc_class_b', label: 'Alphabet Inc Class B', color: '#f50057' },
        { id: 'alphabet_inc_class_c', label: 'Alphabet Inc Class C', color: '#ff9800' }
    ];

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleSeriesChange = (event: SelectChangeEvent) => {
        setSelectedSeries(event.target.value);
    };

    const handleFilterMethodChange = (event: SelectChangeEvent) => {
        setFilterMethod(event.target.value);
    };

    const handleMatchTypeChange = (event: SelectChangeEvent) => {
        setMatchType(event.target.value);
    };

    const handleAddCondition = () => {
        const newId = (Math.max(...conditions.map(c => parseInt(c.id))) + 1).toString();
        setConditions([...conditions, { id: newId, expression: '' }]);
    };

    const handleDeleteCondition = (id: string) => {
        setConditions(conditions.filter(condition => condition.id !== id));
    };

    const handleConditionChange = (id: string, value: string) => {
        setConditions(conditions.map(condition =>
            condition.id === id ? { ...condition, expression: value } : condition
        ));
    };

    return (
        <Box sx={{ p: 3 }}>
            <Paper sx={{ p: 3, position: 'relative' }}>
                <IconButton
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                    onClick={onClose}
                >
                    <CloseIcon />
                </IconButton>

                <Typography variant="h5" gutterBottom>
                    {`Edit ${chartTitle}`}
                </Typography>

                <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
                    <Tab label="Display" />
                    <Tab label="Data" />
                    <Tab label="Properties" />
                </Tabs>

                {/* Display Tab */}
                {tabValue === 0 && (
                    <Box>
                        <TextField
                            fullWidth
                            label="Chart Title"
                            value={chartTitle}
                            onChange={(e) => setChartTitle(e.target.value)}
                            sx={{ mb: 3 }}
                        />

                        <Grid container spacing={3}>
                            <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Axis Settings
                                </Typography>

                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>X-Axis Type</InputLabel>
                                    <Select
                                        value="time"
                                        label="X-Axis Type"
                                    >
                                        <MenuItem value="time">Time</MenuItem>
                                        <MenuItem value="linear">Linear</MenuItem>
                                        <MenuItem value="log">Logarithmic</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Y-Axis Type</InputLabel>
                                    <Select
                                        value="linear"
                                        label="Y-Axis Type"
                                    >
                                        <MenuItem value="linear">Linear</MenuItem>
                                        <MenuItem value="log">Logarithmic</MenuItem>
                                        <MenuItem value="percentage">Percentage</MenuItem>
                                    </Select>
                                </FormControl>

                                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                                    <FormControlLabel
                                        control={<Switch defaultChecked />}
                                        label="Show X-Axis Grid"
                                    />
                                    <FormControlLabel
                                        control={<Switch defaultChecked />}
                                        label="Show Y-Axis Grid"
                                    />
                                </Stack>
                            </Grid>

                            <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Visual Settings
                                </Typography>

                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Chart Type</InputLabel>
                                    <Select
                                        value="line"
                                        label="Chart Type"
                                    >
                                        <MenuItem value="line">Line</MenuItem>
                                        <MenuItem value="bar">Bar</MenuItem>
                                        <MenuItem value="area">Area</MenuItem>
                                        <MenuItem value="scatter">Scatter</MenuItem>
                                        <MenuItem value="candlestick">Candlestick</MenuItem>
                                    </Select>
                                </FormControl>

                                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                                    <FormControlLabel
                                        control={<Switch defaultChecked />}
                                        label="Show Legend"
                                    />
                                    <FormControlLabel
                                        control={<Switch />}
                                        label="Show Tooltips"
                                    />
                                </Stack>
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {/* Data Tab */}
                {tabValue === 1 && (
                    <Box>
                        <Typography variant="h6" gutterBottom>Filtered Series</Typography>
                        <Typography variant="body2" gutterBottom>Time series</Typography>

                        <Divider sx={{ my: 2 }} />

                        <Box component="nav" aria-label="Filter Options">
                            <Tabs value={0} sx={{ mb: 3 }}>
                                <Tab label="Display" disabled />
                                <Tab label="Data" />
                                <Tab label="Properties" disabled />
                            </Tabs>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Filter
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                Write a mathematical condition using other series in your formula by typing $ or a series name.
                            </Typography>
                            <Typography variant="body2" gutterBottom sx={{ fontStyle: 'italic', mb: 2 }}>
                                Press enter to register your expression, and 'Apply Filter' when you have entered all desired conditions.
                            </Typography>

                            <Box sx={{ display: 'flex', mb: 2 }}>
                                <Typography variant="body2" sx={{ mr: 2, minWidth: 100 }}>
                                    Source Plot:
                                </Typography>

                                <FormControl fullWidth size="small">
                                    <Select
                                        value={selectedSeries}
                                        onChange={handleSeriesChange}
                                        size="small"
                                    >
                                        {seriesOptions.map(option => (
                                            <MenuItem key={option.id} value={option.id}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Box
                                                        sx={{
                                                            width: 16,
                                                            height: 16,
                                                            bgcolor: option.color,
                                                            borderRadius: 0.5,
                                                            mr: 1
                                                        }}
                                                    />
                                                    {option.label}
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>

                            <Box sx={{ display: 'flex', mb: 2 }}>
                                <Typography variant="body2" sx={{ mr: 2, minWidth: 100 }}>
                                    Filter Method:
                                </Typography>

                                <FormControl fullWidth size="small">
                                    <Select
                                        value={filterMethod}
                                        onChange={handleFilterMethodChange}
                                        size="small"
                                    >
                                        <MenuItem value="keep">Keep data</MenuItem>
                                        <MenuItem value="remove">Remove data</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>

                            <Box sx={{ display: 'flex', mb: 2, alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ mr: 2, minWidth: 100 }}>
                                    Match Type:
                                </Typography>

                                <FormControl fullWidth size="small">
                                    <Select
                                        value={matchType}
                                        onChange={handleMatchTypeChange}
                                        size="small"
                                        displayEmpty
                                    >
                                        <MenuItem value="all">
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                Matching <Box sx={{
                                                    bgcolor: '#e0e0e0',
                                                    px: 0.5,
                                                    mx: 0.5,
                                                    borderRadius: 0.5,
                                                    fontSize: '0.8rem'
                                                }}>ALL</Box> conditions
                                            </Box>
                                        </MenuItem>
                                        <MenuItem value="any">
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                Matching <Box sx={{
                                                    bgcolor: '#e0e0e0',
                                                    px: 0.5,
                                                    mx: 0.5,
                                                    borderRadius: 0.5,
                                                    fontSize: '0.8rem'
                                                }}>ANY</Box> conditions
                                            </Box>
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </Box>

                        <Typography variant="subtitle1" gutterBottom>
                            Filter Conditions
                        </Typography>

                        <List sx={{ mb: 3 }}>
                            {conditions.map((condition) => (
                                <ListItem
                                    key={condition.id}
                                    secondaryAction={
                                        <IconButton
                                            edge="end"
                                            aria-label="delete"
                                            onClick={() => handleDeleteCondition(condition.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    }
                                    disablePadding
                                    sx={{ mb: 1 }}
                                >
                                    <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                                        <Box
                                            sx={{
                                                bgcolor: '$A' === condition.expression.substring(0, 2) ? '#3f51b5' : '#f50057',
                                                color: 'white',
                                                px: 1,
                                                mr: 2,
                                                borderRadius: 0.5,
                                                minWidth: 30,
                                                textAlign: 'center'
                                            }}
                                        >
                                            {condition.id}
                                        </Box>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            value={condition.expression}
                                            onChange={(e) => handleConditionChange(condition.id, e.target.value)}
                                            placeholder="Enter condition (e.g. > 100)"
                                        />
                                    </Box>
                                </ListItem>
                            ))}
                        </List>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Button
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={handleAddCondition}
                            >
                                Add condition, e.g. $A &lt; 100
                            </Button>

                            <Button
                                variant="contained"
                                onClick={onSave}
                            >
                                Apply Filter
                            </Button>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="subtitle1" gutterBottom>
                            Inputs
                        </Typography>

                        <List>
                            {seriesOptions.map((option) => (
                                <ListItem
                                    key={option.id}
                                    disablePadding
                                    sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Box
                                            sx={{
                                                width: 24,
                                                height: 24,
                                                bgcolor: option.color,
                                                borderRadius: 0.5,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                mr: 2
                                            }}
                                        >
                                            {option.label.charAt(option.label.length - 1)}
                                        </Box>
                                        {option.label}
                                    </Box>
                                    <Button
                                        variant="text"
                                        size="small"
                                        color="primary"
                                    >
                                        View Details
                                    </Button>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}

                {/* Properties Tab */}
                {tabValue === 2 && (
                    <Box>
                        <Typography>Chart properties configuration</Typography>
                        {/* Add additional properties settings as needed */}
                    </Box>
                )}

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="outlined"
                        onClick={onClose}
                        sx={{ mr: 2 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={onSave}
                    >
                        Save Changes
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default TimeSeriesEditor; 