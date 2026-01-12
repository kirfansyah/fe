import { useState, useEffect, useCallback } from "react";
import API from "../services/EbookService";

// Dummy data
const DUMMY_EBOOKS = [
  {
    id_ebook: 1,
    title: "Panduan Belajar React (dummy data)",
    author: "John Doe",
    description: "Belajar React dari dasar",
    category_id: 1,
    subcategory_id: 1,
    company_id: 1,
    contents: [
      { id_ebook_content: 1, content_type_name: "Introduction to React" },
      { id_ebook_content: 2, content_type_name: "Components & Props" },
    ],
  },
  {
    id_ebook: 2,
    title: "Belajar HTML Dasar (dummy data)",
    author: "Jane Smith",
    description: "HTML untuk pemula",
    category_id: 2,
    subcategory_id: 3,
    company_id: 1,
    contents: [
      {
        id_ebook_content: 3,
        content_type_name: "Introducing to HTML (dummy data)",
      },
    ],
  },
  {
    id_ebook: 3,
    title: "Belajar Next.js (dummy data)",
    company_id: 2,
    contents: [
      { id_ebook_content: 4, content_type_name: "Introduction to Next.js" },
      { id_ebook_content: 5, content_type_name: "Components" },
    ],
  },
];

export function useEbooks() {
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categorys, setCategorys] = useState([]);
  const [subCategorys, setSubCategorys] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [companys, setCompanys] = useState([]);

  // get semua data ebook
  const fetchEbooks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await API.getAllEbook();
      setEbooks(res.data);
      // setEbooks(DUMMY_EBOOKS);
    } catch (err) {
      setError(err.message || "Failed to fetch ebooks");
      console.error("Error fetching ebooks:", err);
      // Jika error 401, gunakan dummy data
      if (err.message.includes("401") || err.message.includes("Unauthorized")) {
        console.warn("⚠️ Using dummy data due to authentication error");
        setEbooks(DUMMY_EBOOKS);
        setError("Using demo data (not authenticated)");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Get ebook by ID
  const getEbookById = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const res = await API.getEbookById(id);
      return res.data;
    } catch (err) {
      setError(err.message || "Failed to fetch ebook");
      console.error("Error fetching ebook:", err);

      // Return dummy data jika error
      const dummyEbook = DUMMY_EBOOKS.find((e) => e.id_ebook === parseInt(id));
      if (dummyEbook) {
        return dummyEbook;
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get ebook by ID
  const getEbookDetailById = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const res = await API.getEbookDetailById(id);
      return res.data;
    } catch (err) {
      setError(err.message || "Failed to fetch ebook");
      console.error("Error fetching ebook:", err);

      // Return dummy data jika error
      const dummyEbook = DUMMY_EBOOKS.find((e) => e.id_ebook === parseInt(id));
      if (dummyEbook) {
        return dummyEbook;
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // save data ebook
  const addEbook = useCallback(
    async (ebookData) => {
      setLoading(true);
      setError(null);

      try {
        const newEbook = await API.createEbook(ebookData);
        // Refresh list
        await fetchEbooks();

        return newEbook.data;
      } catch (err) {
        const errorMessage = err.message || "Failed to create ebook";
        setError(errorMessage);
        console.error("Error creating ebook:", err);

        // Show alert to user
        alert(`Failed to create ebook: ${errorMessage}`);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchEbooks]
  );

  // Update ebook
  const updateEbook = useCallback(
    async (id, ebookData) => {
      setLoading(true);
      setError(null);

      try {
        const updatedEbook = await API.updateEbook(id, ebookData);

        await fetchEbooks();

        return updatedEbook.data;
      } catch (err) {
        const errorMessage = err.message || "Failed to update ebook";
        setError(errorMessage);
        console.error("Error updating ebook:", err);

        alert(`Failed to update ebook: ${errorMessage}`);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchEbooks]
  );

  // Delete ebook
  const deleteEbook = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);

      try {
        await API.deleteEbook(id);

        await fetchEbooks();

        return true;
      } catch (err) {
        const errorMessage = err.message || "Failed to delete ebook";
        setError(errorMessage);
        console.error("Error deleting ebook:", err);

        alert(`Failed to delete ebook: ${errorMessage}`);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchEbooks]
  );

  //  get all data Category
  const fetchCategory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await API.getAllCategory();
      setCategorys(res.data);
    } catch (err) {
      setError(err.message || "Failed to fetch categorys");
      console.error("Error fetching category:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  //  get all data Sub Category
  const fetchSubCategory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await API.getAllSubCategory();
      setSubCategorys(res.data);
    } catch (err) {
      setError(err.message || "Failed to fetch subcategorys");
      console.error("Error fetching subcategory:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  //  get all data Employee
  const fetchEmployee = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await API.getAllEmployee();
      setEmployees(res.data);
    } catch (err) {
      setError(err.message || "Failed to fetch Employees");
      console.error("Error fetching Employee:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // get all data Company
  const fetchCompany = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await API.getAllCompany();
      setCompanys(res.data);
    } catch (err) {
      setError(err.message || "Failed to fetch companys");
      console.error("Error fetching Company:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.all([
      fetchEbooks(),
      fetchCategory(),
      fetchSubCategory(),
      fetchEmployee(),
      fetchCompany(),
    ]);
  }, [
    fetchEbooks,
    fetchCategory,
    fetchSubCategory,
    fetchEmployee,
    fetchCompany,
  ]);

  return {
    ebooks,
    categorys,
    subCategorys,
    loading,
    error,
    employees,
    companys,
    fetchEbooks,
    getEbookById,
    getEbookDetailById,
    addEbook,
    updateEbook,
    deleteEbook,
    fetchCategory,
    fetchSubCategory,
    fetchEmployee,
    fetchCompany,
  };
}
