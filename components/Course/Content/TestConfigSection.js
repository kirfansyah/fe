import React from 'react';
import { CustomSelect } from './CustomSelect';
import { RANDOM_TYPES, NUMBERS, POINTS, DISTRIBUTION_TYPES, DURATIONS } from './constants';
import { HelpCircle } from 'lucide-react';

export const TestConfigSection = ({ testConfig, onChange, disabled }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Random Type */}
            <div className="relative">
                <CustomSelect
                    label="Random Type"
                    value={testConfig.randomType}
                    options={RANDOM_TYPES}
                    placeholder="Select Random Type"
                    onChange={(val) => onChange('randomType', val)}
                    disabled={disabled}
                    tooltip="Choose how questions will be randomized"
                />
            </div>

            {/* Total Number */}
            <div className="relative">
                <CustomSelect
                    label="Total Questions"
                    value={testConfig.totalNumber}
                    options={NUMBERS}
                    placeholder="Select number"
                    onChange={(val) => onChange('totalNumber', val)}
                    disabled={disabled}
                    tooltip="Total number of questions in this test"
                />
            </div>

            {/* Total Points */}
            <div className="relative">
                <CustomSelect
                    label="Total Points"
                    value={testConfig.totalPoints}
                    options={POINTS}
                    placeholder="Select total points"
                    onChange={(val) => onChange('totalPoints', val)}
                    disabled={disabled}
                    tooltip="Maximum points achievable in this test"
                />
            </div>

            {/* Point Distribution */}
            <div className="relative">
                <CustomSelect
                    label="Point Distribution"
                    value={testConfig.pointDistribution}
                    options={DISTRIBUTION_TYPES}
                    placeholder="Select type"
                    onChange={(val) => onChange('pointDistribution', val)}
                    disabled={disabled}
                    tooltip="Equal: Same points for all | Custom: Manually set | Weighted: Different weights"
                />
            </div>

            {/* Time Duration */}
            <div className="relative md:col-span-2 lg:col-span-2">
                <CustomSelect
                    label="Time Duration"
                    value={testConfig.timeDuration}
                    options={DURATIONS}
                    placeholder="Select duration"
                    onChange={(val) => onChange('timeDuration', val)}
                    disabled={disabled}
                    tooltip="Maximum time allowed to complete the test"
                />
            </div>
        </div>
    );
};