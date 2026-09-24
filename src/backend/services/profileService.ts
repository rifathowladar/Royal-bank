import { db, simulateNetworkDelay } from '../mockApi/storage.ts';
import { FullCustomerProfile, NomineeDetails, EmploymentDetails } from '../types/index.ts';

const defaultProfiles: Record<string, FullCustomerProfile> = {
  'cust-001': {
    id: 'cust-001',
    customerNumber: 'RB-984021',
    title: 'Mr.',
    firstName: 'Alexander',
    lastName: 'Sterling',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    dateOfBirth: '1982-04-18',
    gender: 'Male',
    nationality: 'United States',
    maritalStatus: 'Married',
    fathersName: 'Arthur Sterling',
    mothersName: 'Eleanor Sterling',
    taxResidency: 'United States (IRS W-9)',
    nationalIdMasked: '•••-••-4921',
    passportMasked: 'USA ••••• 4921',
    phone: '+1 (212) 555-0199',
    email: 'alexander.sterling@royalbank.com',
    alternatePhone: '+1 (212) 555-9081',
    emergencyContactName: 'Clara Sterling (Spouse)',
    emergencyContactPhone: '+1 (212) 555-0192',
    residentialAddress: {
      line1: '450 Park Avenue',
      line2: 'Suite 2800 / Penthouse North',
      city: 'New York',
      state: 'NY',
      postalCode: '10022',
      country: 'United States',
    },
    permanentAddress: {
      line1: '450 Park Avenue',
      line2: 'Suite 2800 / Penthouse North',
      city: 'New York',
      state: 'NY',
      postalCode: '10022',
      country: 'United States',
    },
    sameAsResidential: true,
    employment: {
      employmentStatus: 'Business Owner',
      occupation: 'Managing Director & Venture Partner',
      designation: 'Managing Partner',
      companyName: 'Sterling Global Capital Partners LP',
      companyAddress: 'Rockefeller Plaza, 30th Floor, New York, NY 10112',
      industry: 'Private Equity & Sovereign Wealth Management',
      monthlyIncome: 145000,
      annualIncome: 1740000,
      sourceOfFunds: 'Capital Gains, Dividends & Management Advisory Fees',
      tinOrTaxId: 'US-TIN-88920141',
      experienceYears: 18,
    },
    nominee: {
      fullName: 'Clara Vivienne Sterling',
      relationship: 'Spouse',
      dateOfBirth: '1985-09-12',
      phone: '+1 (212) 555-0192',
      email: 'clara.sterling@outlook.com',
      identityType: 'Passport',
      identityNumberMasked: 'USA ••••• 8820',
      sharePercentage: 100,
      streetAddress: '450 Park Avenue, Penthouse North',
      city: 'New York',
      state: 'NY',
      postalCode: '10022',
      country: 'United States',
    },
    tier: 'Royal Sovereign Private Client',
    memberSince: 'March 2021',
  },
  'cust-002': {
    id: 'cust-002',
    customerNumber: 'RB-771940',
    title: 'Lady',
    firstName: 'Elena',
    lastName: 'Rostova',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    dateOfBirth: '1976-11-09',
    gender: 'Female',
    nationality: 'United Kingdom',
    maritalStatus: 'Single',
    taxResidency: 'United Kingdom (HMRC)',
    nationalIdMasked: '••• ••• 1048',
    passportMasked: 'GBR ••••• 1048',
    phone: '+44 20 7946 0912',
    email: 'elena.rostova@royalbank.com',
    residentialAddress: {
      line1: '14 Berkeley Square',
      city: 'London',
      state: 'Greater London',
      postalCode: 'W1J 6BQ',
      country: 'United Kingdom',
    },
    sameAsResidential: true,
    employment: {
      employmentStatus: 'Investor',
      occupation: 'Art Collection Curator & Asset Allocator',
      designation: 'Principal Trustee',
      companyName: 'Rostova Family Office London',
      companyAddress: 'Mayfair, London, UK',
      industry: 'Art & Family Office Advisory',
      monthlyIncome: 210000,
      annualIncome: 2520000,
      sourceOfFunds: 'Trust Distributions & Real Estate Holdings',
      tinOrTaxId: 'UK-UTR-99104821',
      experienceYears: 22,
    },
    nominee: {
      fullName: 'Dmitri Rostov',
      relationship: 'Sibling',
      dateOfBirth: '1980-03-24',
      phone: '+44 20 7946 0883',
      identityType: 'Passport',
      identityNumberMasked: 'GBR ••••• 7719',
      sharePercentage: 100,
      streetAddress: '14 Berkeley Square',
      city: 'London',
      state: 'Greater London',
      postalCode: 'W1J 6BQ',
      country: 'United Kingdom',
    },
    tier: 'Royal Sovereign',
    memberSince: 'August 2019',
  },
};

const STORAGE_KEY = 'royal_bank_profile_data';

function loadStoredProfiles(): Record<string, FullCustomerProfile> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProfiles));
      return defaultProfiles;
    }
    return JSON.parse(raw);
  } catch {
    return defaultProfiles;
  }
}

function saveProfiles(profiles: Record<string, FullCustomerProfile>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.warn('Failed to save profiles to storage', e);
  }
}

class ProfileService {
  async getProfile(customerId = 'cust-001'): Promise<FullCustomerProfile> {
    await simulateNetworkDelay(100);
    const profiles = loadStoredProfiles();
    if (profiles[customerId]) {
      return profiles[customerId];
    }
    // Fallback to customer-001 clone
    const fallback = { ...defaultProfiles['cust-001'], id: customerId };
    profiles[customerId] = fallback;
    saveProfiles(profiles);
    return fallback;
  }

  async updatePersonalDetails(
    customerId: string,
    data: Partial<FullCustomerProfile>
  ): Promise<FullCustomerProfile> {
    await simulateNetworkDelay(250);
    const profiles = loadStoredProfiles();
    const current = profiles[customerId] || defaultProfiles['cust-001'];
    
    const updated: FullCustomerProfile = {
      ...current,
      ...data,
      id: customerId,
    };

    profiles[customerId] = updated;
    saveProfiles(profiles);

    // Sync to main customer if matches
    const customer = db.customers.find((c) => c.id === customerId);
    if (customer) {
      if (data.firstName) customer.firstName = data.firstName;
      if (data.lastName) customer.lastName = data.lastName;
      if (data.dateOfBirth) customer.dateOfBirth = data.dateOfBirth;
      db.persist('customers', db.customers);
    }

    return updated;
  }

  async updateContactDetails(
    customerId: string,
    data: {
      phone: string;
      email: string;
      alternatePhone?: string;
      emergencyContactName?: string;
      emergencyContactPhone?: string;
      residentialAddress: FullCustomerProfile['residentialAddress'];
      permanentAddress?: FullCustomerProfile['permanentAddress'];
      sameAsResidential: boolean;
    }
  ): Promise<FullCustomerProfile> {
    await simulateNetworkDelay(250);
    const profiles = loadStoredProfiles();
    const current = profiles[customerId] || defaultProfiles['cust-001'];

    const updated: FullCustomerProfile = {
      ...current,
      phone: data.phone,
      email: data.email,
      alternatePhone: data.alternatePhone,
      emergencyContactName: data.emergencyContactName,
      emergencyContactPhone: data.emergencyContactPhone,
      residentialAddress: data.residentialAddress,
      permanentAddress: data.sameAsResidential ? data.residentialAddress : data.permanentAddress,
      sameAsResidential: data.sameAsResidential,
    };

    profiles[customerId] = updated;
    saveProfiles(profiles);

    // Sync to customer
    const customer = db.customers.find((c) => c.id === customerId);
    if (customer) {
      customer.phone = data.phone;
      customer.email = data.email;
      customer.address = {
        line1: data.residentialAddress.line1,
        city: data.residentialAddress.city,
        state: data.residentialAddress.state,
        postalCode: data.residentialAddress.postalCode,
        country: data.residentialAddress.country,
      };
      db.persist('customers', db.customers);
    }

    return updated;
  }

  async updateNomineeDetails(customerId: string, nominee: NomineeDetails): Promise<FullCustomerProfile> {
    await simulateNetworkDelay(250);
    const profiles = loadStoredProfiles();
    const current = profiles[customerId] || defaultProfiles['cust-001'];

    const updated: FullCustomerProfile = {
      ...current,
      nominee,
    };

    profiles[customerId] = updated;
    saveProfiles(profiles);
    return updated;
  }

  async updateEmploymentDetails(customerId: string, employment: EmploymentDetails): Promise<FullCustomerProfile> {
    await simulateNetworkDelay(250);
    const profiles = loadStoredProfiles();
    const current = profiles[customerId] || defaultProfiles['cust-001'];

    const updated: FullCustomerProfile = {
      ...current,
      employment,
    };

    profiles[customerId] = updated;
    saveProfiles(profiles);
    return updated;
  }

  async updateAvatar(customerId: string, avatarUrl: string): Promise<FullCustomerProfile> {
    await simulateNetworkDelay(150);
    const profiles = loadStoredProfiles();
    const current = profiles[customerId] || defaultProfiles['cust-001'];

    const updated: FullCustomerProfile = {
      ...current,
      avatarUrl,
    };

    profiles[customerId] = updated;
    saveProfiles(profiles);
    return updated;
  }
}

export const profileService = new ProfileService();
