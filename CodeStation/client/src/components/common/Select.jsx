import PropTypes from "prop-types";
import { PiCaretDownBold } from "react-icons/pi";

/**
 * Custom Select dropdown with styled appearance.
 *
 * @param {Object} props
 * @param {function} props.onChange - Callback for handling selection change.
 * @param {string} props.value - Current selected value.
 * @param {string[]} props.options - Array of options to choose from.
 * @param {string} props.title - Label title for the select dropdown.
 */
function Select({ onChange, value, options, title }) {
    return (
        <div className="relative w-full">
            <label className="mb-2">{title}</label>
            <select
                className="w-full rounded-md border-2 border-blue-400 bg-gray-900 px-4 py-2 text-white outline-none"
                value={value}
                onChange={onChange}
            >
                {options.sort().map((option) => {
                    const name = option.charAt(0).toUpperCase() + option.slice(1);
                    return (
                        <option key={name} value={option}>
                            {name}
                        </option>
                    );
                })}
            </select>
            <PiCaretDownBold
                size={16}
                className="absolute bottom-3 right-4 z-10 text-white"
            />
        </div>
    );
}

Select.propTypes = {
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
    title: PropTypes.string.isRequired,
};

export default Select;

