// Quick test to verify Language system is working
// This file can be deleted after testing

const testLanguageSystem = async () => {
  try {
    // Test 1: Get languages from API
    console.log('🔍 Testing Language API...');
    const response = await fetch('http://localhost:5000/api/languages');
    const data = await response.json();
    
    if (data.success && data.data.languages) {
      console.log('✅ API Response Structure:', {
        success: data.success,
        totalLanguages: data.data.total,
        sampleLanguage: data.data.languages[0]
      });
      
      const activeLanguages = data.data.languages.filter(lang => lang.isActive);
      console.log(`✅ Active languages found: ${activeLanguages.length}`);
      
      activeLanguages.forEach(lang => {
        console.log(`  - ${lang.name} (${lang.code}): ${lang._id}`);
      });
      
      return true;
    } else {
      console.error('❌ Invalid API response structure');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error testing Language system:', error);
    return false;
  }
};

// Export for use in browser console
window.testLanguageSystem = testLanguageSystem;

console.log('🧪 Language System Test loaded. Run testLanguageSystem() in console to test.');