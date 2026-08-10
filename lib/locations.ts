export type LocationOption = {
    value: string;
    label: string;
};

export const countryOptions: LocationOption[] = [
    { value: "United States", label: "United States" },
    { value: "Canada", label: "Canada" },
    { value: "United Kingdom", label: "United Kingdom" },
    { value: "Germany", label: "Germany" },
    { value: "India", label: "India" },
    { value: "Australia", label: "Australia" },
    { value: "Singapore", label: "Singapore" },
    { value: "United Arab Emirates", label: "United Arab Emirates" },
    { value: "France", label: "France" },
    { value: "Netherlands", label: "Netherlands" },
];

export const cityOptions: Record<string, LocationOption[]> = {
    "United States": [
        { value: "New York, NY", label: "New York" },
        { value: "San Francisco, CA", label: "San Francisco" },
        { value: "Austin, TX", label: "Austin" },
        { value: "Seattle, WA", label: "Seattle" },
        { value: "Chicago, IL", label: "Chicago" },
    ],

    Canada: [
        { value: "Toronto, ON", label: "Toronto" },
        { value: "Vancouver, BC", label: "Vancouver" },
        { value: "Montreal, QC", label: "Montreal" },
        { value: "Ottawa, ON", label: "Ottawa" },
    ],

    "United Kingdom": [
        { value: "London", label: "London" },
        { value: "Manchester", label: "Manchester" },
        { value: "Edinburgh", label: "Edinburgh" },
        { value: "Birmingham", label: "Birmingham" },
    ],

    Germany: [
        { value: "Berlin", label: "Berlin" },
        { value: "Munich", label: "Munich" },
        { value: "Hamburg", label: "Hamburg" },
        { value: "Frankfurt", label: "Frankfurt" },
    ],

    India: [
        { value: "Bengaluru, Karnataka", label: "Bengaluru" },
        { value: "Mumbai, Maharashtra", label: "Mumbai" },
        { value: "Delhi, Delhi", label: "Delhi" },
        { value: "Hyderabad, Telangana", label: "Hyderabad" },
        { value: "Pune, Maharashtra", label: "Pune" },
        { value: "Chennai, Tamil Nadu", label: "Chennai" },
        { value: "Gurugram, Haryana", label: "Gurugram" },
    ],

    Australia: [
        { value: "Sydney, NSW", label: "Sydney" },
        { value: "Melbourne, VIC", label: "Melbourne" },
        { value: "Brisbane, QLD", label: "Brisbane" },
        { value: "Perth, WA", label: "Perth" },
    ],

    Singapore: [
        { value: "Singapore", label: "Singapore" },
    ],

    "United Arab Emirates": [
        { value: "Dubai", label: "Dubai" },
        { value: "Abu Dhabi", label: "Abu Dhabi" },
    ],

    France: [
        { value: "Paris", label: "Paris" },
        { value: "Lyon", label: "Lyon" },
        { value: "Marseille", label: "Marseille" },
    ],

    Netherlands: [
        { value: "Amsterdam", label: "Amsterdam" },
        { value: "Rotterdam", label: "Rotterdam" },
        { value: "Utrecht", label: "Utrecht" },
    ],
};
