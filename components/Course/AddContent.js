import { useState } from "react";
import { 
    ChevronDown,
    Minus,
    Plus,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Link,
    Image,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    List,
    ListOrdered,
    Outdent,
    Indent
} from "lucide-react";
import dynamic from "next/dynamic";
import 'react-quill/dist/quill.snow.css';
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })
export default function AddContent({onBack, contentTypes}) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedContentType, setSelectedContentType] = useState('');
    // React Quill modules configuration
    const quillModules = {
        toolbar: [
            [{ 'header': ['1', '2', '3', '4', '5', '6', false] }],
            [{ 'font': [] }],
            [{ 'size': [] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, 
             { 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'align': [] }],
            ['link', 'image', 'video'],
            ['code-block'],
            ['clean']
        ],
        clipboard: {
            // toggle to add extra line breaks when pasting HTML:
            matchVisual: false,
        }
    };
    // React Quill formats
    const quillFormats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'color', 'background',
        'list', 'bullet', 'indent',
        'align',
        'link', 'image', 'video',
        'code-block'
    ];
    
    return (
    <div className="mt-6 ml-2 grid grid-cols-1 gap-6">
        <div className="min-h-screen bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Add New Content</h2>  
            </div>
            <div className="mb-4 w-1/2">
                <label className="block text-sm font-medium mb-1">Select Content Type</label>
                <div className="relative">
                    <button 
                        onClick={() => setShowDropdown(!showDropdown)} 
                        className="w-full bg-white border border-gray-300 rounded px-4 py-2 text-left flex justify-between items-center"
                    >
                        {selectedContentType || 'Choose content type'}
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                    </button>
                    {showDropdown && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
                            {contentTypes.map((item) => (
                                <div key={item.id_content_type}>
                                    {item.children && item.children.length > 0 ? (
                                        <div className="border-t border-gray-200">
                                            <div className="px-4 py-2 font-medium bg-gray-50">{item.name}</div>
                                            {item.children.map((child) => (
                                                <div
                                                    key={child.parent_id}
                                                    onClick={() => {
                                                        setSelectedContentType(child.name);
                                                        setShowDropdown(false);
                                                    }}
                                                    className="px-6 py-2 hover:bg-gray-100 cursor-pointer"
                                                >
                                                    {child.name}
                                                </div>
                                            ))} 
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => {
                                                setSelectedContentType(item.name);
                                                setShowDropdown(false);
                                            }}
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                        >
                                            {item.name}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="bg-white">
                <ReactQuill
                    theme="snow"
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Start writing your content here..."
                    style={{ height: '300px' }}
                />
            </div>
            <div className="mt-12 flex gap-6 justify-start items-center">
                <button className="px-6 py-2 bg-green-600 text-white rounded">
                    Save
                </button>
                <button onClick={onBack} className="px-6 py-2 bg-red-600 text-gray-700 rounded hover:bg-gray-300">
                    Cancel
                </button>
            </div>
        </div>
    </div>
    );
}